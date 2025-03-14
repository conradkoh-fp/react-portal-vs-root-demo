import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
//MOUNT POINTS - these are the divs in index.html
const DRAWER_PORTAL_ID = "drawer-portal-id"; //the mount point for a component mounted via createPortal
const DRAWER_ROOT_ID = "drawer-root-id"; //the mount point for a component mounted via createRoot
export default function Home() {
  return <CreatePortalVsCreateRootDemo />;
}

/**
 * This is the entry point for the demo.
 * The demo aims to show the benefits of createPortal used to access data rendered outside of the app root.
 * Aims
 * 1. Demonstrate context state access
 * 2. Demonstrate reactivity
 *
 * How to verfiy
 * 1. Start the app
 * 2. Click on "Show"
 * 3. Validate the following:
 *     1. The one using createRoot fails to access the state
 *     2. The one using createPortal successfully access the state and maintains reactivity
 * @returns
 */
function CreatePortalVsCreateRootDemo() {
  const [counter, setCounter] = useState(0); //the counter exists to demonstrate reactivity
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000); //increment the counter
    return () => clearInterval(interval);
  });
  return (
    <div className="pt-6">
      <AppDataContext.Provider value={{ timezone: "Asia/Singapore", counter }}>
        <DrawerTrigger />
      </AppDataContext.Provider>
    </div>
  );
}

/**
 * DrawerTrigger is a component that triggers a drawer.
 * This demonstrates how the show function can be defined and consumed
 */
function DrawerTrigger() {
  const { show, portalElem } = useDrawer();
  return (
    <>
      <div>Click this to render the drawer content</div>
      <button
        type="button"
        className="text-xl font-bold border border-black p-2 rounded"
        onClick={() =>
          show({
            content: <DemoContent />,
          })
        }
      >
        Show Dialog
      </button>
      {/* IMPORTANT: A portal has 2 places that needs to be rendered. One from within a place within the context, and the portal to target outside of it */}
      {portalElem}
    </>
  );
}

/**
 * DemoContent demonstrates that we can access the context data as usual without jumping through any hoops.
 * 1. Access context data
 * 2. Subscribe to changes in context state
 * Expectation: the mount point outside of app root should remain reactive
 * @returns
 */
function DemoContent() {
  // aim to use the context info here
  const appData = useContext(AppDataContext);
  if (appData == null) {
    return <div>Failed to get app data</div>;
  }
  return (
    <div>
      App Data: Timezone is {appData.timezone}, Counter is {appData.counter}
    </div>
  );
}

function useDrawer() {
  const [portalElem, setPortalElem] = useState<React.ReactNode | null>(null);
  const [drawerData, setDrawerData] = useState<{
    content: React.ReactNode;
  } | null>(null);

  useEffect(() => {
    const content = <div>{drawerData?.content}</div>;
    // 1. mount for version using createRoot
    const rootMountElem = document.getElementById(DRAWER_ROOT_ID);
    if (rootMountElem) {
      const root = createRoot(rootMountElem);
      root.render(content);
    }

    // 2. mount for version using createPortal
    const portalMountElem = document.getElementById(DRAWER_PORTAL_ID);
    if (portalMountElem) {
      const elem = createPortal(content, portalMountElem);
      setPortalElem(elem);
    } else {
      setPortalElem(<div>Failed to find portal mount point</div>);
    }
  }, [drawerData]);

  return {
    portalElem, //the return value of createPortal needs to be rendered at the lower context
    show: (drawerData: { content: React.ReactNode }) => {
      setDrawerData(drawerData);
    },
    close: () => {
      setDrawerData(null);
    },
  };
}

//Contexts
type AppDataContext = { timezone: string; counter: number };
const AppDataContext = createContext<AppDataContext | null>(null);
