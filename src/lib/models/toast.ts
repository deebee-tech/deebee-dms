import type { Snippet } from "svelte";
import type { MessageType } from "./message-types";

export type Toast = {
   id: string;
   body: string | Snippet;
   type: MessageType;
   duration: number;
};
