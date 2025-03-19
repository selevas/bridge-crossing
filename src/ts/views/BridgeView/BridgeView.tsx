import { useContext, useState, useEffect } from "react";

import AppView from "/src/ts/view";
import ControllerContext from "/src/ts/contexts/controller";

import styles from "./BridgeView.module.css";

export default function BridgeView() {
  const controller = useContext(ControllerContext);

  const [modelState, setModelState] = useState<ModelState>(null);

  useEffect(() => {
    const view: AppView = new AppView(setModelState);
    controller.subscribe(view);
    return () => controller.unsubscribe(view);
  }, []);

  return (
    <div className={styles.bridgeView}>
      <div className={styles.start}></div>
      <div className={styles.bridge}></div>
      <div className={styles.end}></div>
    </div>
  );
}
