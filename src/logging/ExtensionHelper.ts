import {CategoryServiceImpl} from "./CategoryService";
export class ExtensionHelper {

  static registered: boolean = false;


  private ExtensionHelper()
  {
    // Private constructor
  }

  static register(): void {
    if(!ExtensionHelper.registered) {
      if(typeof window !== "undefined") {
        window.addEventListener("message", (ev: MessageEvent) => {
          if (ev.source != window) {
            return;
          }

          if (ev.data && ev.data.type == "tsl-chrome-extension") {
            if (ev.data.text == "configure-for-extension") {
              console.log("Will configure for chrome extension");

              CategoryServiceImpl.getInstance().enableExtensionIntegration();
            }
          }

        }, false);
        ExtensionHelper.registered = true;
      }
    }
  }

}
