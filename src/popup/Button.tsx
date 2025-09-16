import type { Dispatch, SetStateAction } from "react";

import { type IconName } from "@/icons";

import Icon from "./Icon";

import styles from "./Button.module.scss";

type ButtonProps = {
  name: IconName;
  env?: string;
  target?: string;
  setHoverText: Dispatch<SetStateAction<string>>;
};

const Button = ({ name, env, target, setHoverText }: ButtonProps) => {
  const notProd = env !== "prod" && name === "preview";

  const handleClick = () => {
    chrome.tabs.create({ url: target });
  };

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      onMouseEnter={() => setHoverText(name)}
      onMouseLeave={() => setHoverText("")}
      disabled={!env || notProd}
    >
      <Icon name={name} />
      <span>{name}</span>
    </button>
  );
};

export default Button;
