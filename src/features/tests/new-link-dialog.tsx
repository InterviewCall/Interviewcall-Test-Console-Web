"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Dialog } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { Icon } from "@/components/ui/icon";
import { toApiError } from "@/lib/api/errors";
import type { TestSchedule } from "@/lib/api/types";
import { useNewTestLink } from "./api";
import { formatIstDate, formatIstTime, formatIstWindow } from "./ist";

/** What stays on screen once the link has been made: the link itself is not kept anywhere else. */
interface Revealed {
  url: string;
  name: string;
  email: string;
  window: string;
  lastStart: string;
}

/**
 * Makes a fresh start link for a candidate whose email isn't getting through, and shows it once to copy.
 * Making one cancels the previous link, so there is a confirmation first.
 */
export function NewLinkDialog({ schedule, onClose }: { schedule: TestSchedule | null; onClose: () => void }) {
  const makeLink = useNewTestLink();
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Revealed | null>(null);

  function close() {
    setError(null);
    setRevealed(null);
    onClose();
  }

  async function confirm() {
    if (!schedule) return;
    setError(null);
    try {
      const { url } = await makeLink.mutateAsync(schedule.id);
      setRevealed({
        url,
        name: schedule.candidate.fullName,
        email: schedule.candidate.email,
        window: `${formatIstWindow(schedule.startsAt, schedule.endsAt)} IST`,
        lastStart: `${formatIstDate(schedule.latestStartAt)}, ${formatIstTime(schedule.latestStartAt)} IST`,
      });
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  }

  if (revealed) {
    return (
      <Dialog
        open
        onClose={close}
        dismissible={false}
        title={`New link for ${revealed.name}`}
        description={revealed.email}
        footer={<Button onClick={close}>I&apos;ve copied it</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-panel border border-line-strong bg-sunken p-4">
            <code data-testid="new-test-link" className="block select-all break-all font-mono text-[13px] leading-relaxed">
              {revealed.url}
            </code>
            <div className="mt-3 flex justify-end">
              <CopyButton value={revealed.url} label="Copy link" />
            </div>
          </div>
          <p className="text-[13px] text-ink-muted">
            Window {revealed.window}. They can start until {revealed.lastStart}.
          </p>
          <p className="flex items-start gap-2.5 rounded-control bg-warning-tint px-3.5 py-3 text-[13px] text-warning">
            <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
            <span>
              Copy it now. It won&apos;t be shown again, and only this link works. Share it only with {revealed.name}:
              anyone with the link and their email address can start the test.
            </span>
          </p>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={schedule !== null}
      onClose={close}
      dismissible={!makeLink.isPending}
      size="sm"
      title="Get a new link?"
      description={schedule ? `${schedule.candidate.fullName} · ${schedule.candidate.email}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={makeLink.isPending}>
            Cancel
          </Button>
          <Button icon="key" loading={makeLink.isPending} onClick={() => void confirm()}>
            Get new link
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-sm text-ink-muted">
        <p>You&apos;ll get a link to share yourself, for example on WhatsApp. Nothing is emailed.</p>
        <p>
          The link in their invitation email stops working straight away, and anyone already signed in with it is signed out.
        </p>
        <FormError message={error} />
      </div>
    </Dialog>
  );
}
