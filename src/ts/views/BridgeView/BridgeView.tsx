import { useContext, useState, useEffect } from "react";

import styles from "./BridgeView.module.css";

export default function BridgeView() {
  return (
    <div className={styles.bridgeView}>
      <div className={styles.start}></div>
      <div className={styles.bridge}></div>
      <div className={styles.end}></div>
    </div>
  );
}
