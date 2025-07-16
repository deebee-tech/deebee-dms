import { toastStore } from "$lib/stores/toast.svelte";
import IsHelper from "@deebeetech/is-helper";
import type { Snippet } from "svelte";
import { v4 as uuidv4 } from "uuid";

export const toastHelper = () => {
   const defaultDuration = 5000;

   const success = (
      body: string | Snippet,
      duration: number = defaultDuration,
   ) => {
      toastStore.addToast({
         id: uuidv4(),
         body,
         type: "success",
         duration,
      });
   };

   const error = (
      body: string | Snippet,
      duration: number = defaultDuration,
   ) => {
      toastStore.addToast({
         id: uuidv4(),
         body,
         type: "error",
         duration,
      });
   };

   const info = (
      body: string | Snippet,
      duration: number = defaultDuration,
   ) => {
      toastStore.addToast({
         id: uuidv4(),
         body,
         type: "info",
         duration,
      });
   };

   const warning = (
      body: string | Snippet,
      duration: number = defaultDuration,
   ) => {
      toastStore.addToast({
         id: uuidv4(),
         body,
         type: "warning",
         duration,
      });
   };

   const generic = (body: string | Snippet, duration: number = 5000) => {
      toastStore.addToast({
         id: uuidv4(),
         body,
         type: "generic",
         duration,
      });
   };

   const formMessage = (message: App.Superforms.Message | undefined) => {
      if (IsHelper.isNullOrUndefined(message)) {
         return;
      }

      switch (message.type) {
         case "error":
            toastHelper().error(message.body);
            break;
         case "success":
            toastHelper().success(message.body);
            break;
         case "warning":
            toastHelper().warning(message.body);
            break;
         default:
            toastHelper().info(message.body);
            break;
      }
   };

   return {
      success,
      error,
      info,
      warning,
      generic,
      formMessage,
   };
};
