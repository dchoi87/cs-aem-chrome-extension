import type { Dispatch, SetStateAction } from "react";

import Icon from "./Icon";

import styles from "./Button.module.scss";

type ButtonProps = {
  name: string;
  env?: string;
  target?: string;
  setHoverText: Dispatch<SetStateAction<string>>;
};

const Button = ({ name, env, target, setHoverText }: ButtonProps) => {
  const handleClick = () => {
    chrome.tabs.create({ url: target });
  };

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      onMouseEnter={() => setHoverText(name)}
      onMouseLeave={() => setHoverText("")}
      disabled={!env}
    >
      <Icon name="dashboard" />
      <span>{name}</span>
    </button>
  );
};

export default Button;
