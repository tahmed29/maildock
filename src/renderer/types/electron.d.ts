import type { MaildockApi } from "../../shared/contracts";

declare global {
  interface Window {
    maildock: MaildockApi;
  }
}