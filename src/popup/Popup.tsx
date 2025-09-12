import { useEffect, useState } from "react";
import classNames from "classnames";

import styles from "./Popup.module.scss";

const Popup = () => {
  const [url, setUrl] = useState<string>("");
  const [env, setEnv] = useState<string>("");
  const [path, setPath] = useState<string>("");
  const [app, setApp] = useState<string>("");
  const [tld, setTld] = useState<string>("");
  const [target, setTarget] = useState<string | undefined>("");
  const [hoverText, setHoverText] = useState<string>("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      if (currentTab?.url) {
        setUrl(currentTab.url);
      }
    });
  }, []);

  useEffect(() => {
    if (url) {
      const _url = new URL(url);
      // host
      const host = _url.host.split(".");
      const subdomain = host[0];
      const domain = host[1];
      const tld = host.length > 3 ? host.slice(2).join(".") : host[2];

      // app
      const config = {
        org: "cedars-sinai",
        edu: "cedars-sinai-edu",
        ["co.uk"]: "cedars-sinai-uk",
      } as const;
      const app = config[tld as keyof typeof config];

      // path
      const pathname = _url.pathname.split("/");
      const idx = pathname.indexOf(app);
      const isDispatcher = !pathname.includes("content") && !pathname.includes(app);
      let path = isDispatcher
        ? pathname.slice(1).join("/").replace(".html", "")
        : pathname
            .slice(idx + 1)
            .join("/")
            .replace(".html", "");

      // set env and path
      if (domain === "cedars-sinai") {
        setEnv(subdomain.split("-")[1] || "prod");
        setPath(path);
        setApp(app);
        setTld(tld);
      }
    }
  }, [url]);

  useEffect(() => {
    if (hoverText && path) {
      let targetUrl;

      switch (hoverText) {
        case "dispatcher":
          targetUrl = `https://www-${env}.cedars-sinai.${tld}/${path}.html`;
          break;
        case "dashboard":
          targetUrl = `https://author-${env}.cedars-sinai.org/sites.html/content/${app}/${path}`;
          break;
        case "editor":
          targetUrl = `https://author-${env}.cedars-sinai.org/editor.html/content/${app}/${path}.html`;
          break;
        case "published":
          targetUrl = `https://author-${env}.cedars-sinai.org/content/${app}/${path}.html?wcmmode=disabled`;
          break;
      }

      setTarget(targetUrl);
    } else {
      setTarget("");
    }
  }, [hoverText, path]);

  const handleClick = () => {
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //   const tabId = tabs[0]?.id;
    //   if (tabId != null) {
    //     chrome.tabs.update(tabId, { url: target });
    //   }
    // });

    chrome.tabs.create({ url: target });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AEM WEB HELPER</h1>
        {env && <div className={styles.env}>{env}</div>}
      </div>
      <div className={styles.url}>
        <div className={styles.target}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M17,5.59V3l3-3V4h4l-3,3h-2.59l-4.49,4.49c.04,.16,.07,.33,.07,.51,0,1.1-.9,2-2,2s-2-.9-2-2,.9-2,2-2c.18,0,.35,.03,.51,.07l4.49-4.49Zm4.83,3.41h-1.34c.32,.93,.51,1.92,.51,2.96-.45,11.96-17.55,11.96-18,0C3,6.98,7.04,2.93,12,2.93c1.05,0,2.06,.19,3,.53v-1.29l1.39-1.39C9.5-1.77,.38,1.95,0,11.96c0,6.64,5.38,12.04,12,12.04s12-5.4,12-12.04c-.06-1.6-.35-3.04-.82-4.32l-1.35,1.35Zm-10.04-1.03l2.61-2.61c-.71-.25-1.51-.4-2.4-.42-9.25,.29-9.25,13.75,0,14.05,5.67-.18,7.86-5.31,6.58-9.32l-2.65,2.65c-.15,1.85-1.45,3.59-3.93,3.66-5.37-.12-5.84-7.62-.22-8Z" />
          </svg>
        </div>
        <div className={styles.hover}>{target || "Target URL"}</div>
      </div>
      <div className={classNames(styles.grid, styles.fourCol)}>
        <button
          className={styles.button}
          onClick={handleClick}
          onMouseEnter={() => setHoverText("dashboard")}
          onMouseLeave={() => setHoverText("")}
          disabled={!env}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="m14 12c0 .696-.073 1.285-.2 1.807-1.653-.893-2.795-1.807-3.3-2.247v-4.005c2.478.263 3.5 1.591 3.5 4.445zm-5.5 0v-4.445c-2.478.263-3.5 1.591-3.5 4.445 0 3.214 1.286 4.5 4.5 4.5 1.526 0 2.604-.302 3.33-.95-2.522-1.364-3.965-2.772-4.037-2.843-.188-.188-.293-.442-.293-.707zm14.5 0c0 4.397-1.021 7.168-1.063 7.284-.104.276-.323.492-.602.591-.129.046-3.232 1.125-9.335 1.125s-9.206-1.079-9.335-1.125c-.278-.099-.498-.315-.602-.591-.043-.116-1.063-2.887-1.063-7.284s1.02-7.168 1.063-7.284c.104-.276.324-.492.602-.591.129-.046 3.232-1.125 9.335-1.125s9.206 1.079 9.335 1.125c.278.099.498.315.602.591.043.116 1.063 2.887 1.063 7.284zm-2.792 6.125c.264-.906.792-3.101.792-6.125s-.528-5.219-.792-6.125c-1.026-.274-3.779-.875-8.208-.875s-7.18.6-8.208.875c-.263.904-.792 3.1-.792 6.125s.528 5.219.792 6.125c1.027.274 3.78.875 8.208.875s7.18-.6 8.208-.875zm-2.208-11.125h-1c-.553 0-1 .448-1 1s.447 1 1 1h1c.553 0 1-.448 1-1s-.447-1-1-1zm0 4h-1c-.553 0-1 .448-1 1s.447 1 1 1h1c.553 0 1-.448 1-1s-.447-1-1-1zm0 4h-1c-.553 0-1 .448-1 1s.447 1 1 1h1c.553 0 1-.448 1-1s-.447-1-1-1z" />
          </svg>
          <span>Dashboard</span>
        </button>
        <button
          className={styles.button}
          onClick={handleClick}
          onMouseEnter={() => setHoverText("editor")}
          onMouseLeave={() => setHoverText("")}
          disabled={!env}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M14.081,5.586.9,18.769A3.064,3.064,0,0,0,5.23,23.1L18.414,9.919Zm1.505,4.333L13,12.505,11.5,11l2.586-2.586ZM3.816,21.688a1.087,1.087,0,0,1-1.5,0,1.062,1.062,0,0,1,0-1.5l7.769-7.77,1.505,1.505Zm17.517-7.06L24,15.962,21.333,17.3,20,19.962,18.667,17.3,16,15.962l2.667-1.334L20,11.962ZM6.667,5.333,4,4,6.667,2.667,8,0,9.333,2.667,12,4,9.333,5.333,8,8Zm12.666-.666L17,3.5l2.333-1.167L20.5,0l1.167,2.333L24,3.5,21.667,4.667,20.5,7Z" />
          </svg>
          <span>Editor</span>
        </button>
        <button
          className={styles.button}
          onClick={handleClick}
          onMouseEnter={() => setHoverText("published")}
          onMouseLeave={() => setHoverText("")}
          disabled={!env}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M17.974,7.146c-.331-.066-.602-.273-.742-.569-1.55-3.271-5.143-5.1-8.734-4.438-3.272,.6-5.837,3.212-6.384,6.501-.162,.971-.15,1.943,.033,2.89,.06,.309-.073,.653-.346,.901-1.145,1.041-1.801,2.524-1.801,4.07,0,3.032,2.467,5.5,5.5,5.5h11c4.136,0,7.5-3.364,7.5-7.5,0-3.565-2.534-6.658-6.026-7.354Zm-1.474,12.854H5.5c-1.93,0-3.5-1.57-3.5-3.5,0-.983,.418-1.928,1.146-2.59,.786-.715,1.155-1.773,.963-2.763-.138-.712-.146-1.445-.024-2.181,.403-2.422,2.365-4.421,4.771-4.862,.385-.07,.768-.104,1.146-.104,2.312,0,4.405,1.289,5.422,3.434,.413,.872,1.2,1.482,2.158,1.673,2.56,.511,4.417,2.779,4.417,5.394,0,3.032-2.468,5.5-5.5,5.5Zm-1.379-7.707c.391,.391,.391,1.023,0,1.414-.195,.195-.451,.293-.707,.293s-.512-.098-.707-.293l-1.707-1.707v5c0,.553-.448,1-1,1s-1-.447-1-1v-5l-1.707,1.707c-.391,.391-1.023,.391-1.414,0s-.391-1.023,0-1.414l2.707-2.707c.386-.386,.893-.58,1.4-.583l.014-.003,.014,.003c.508,.003,1.014,.197,1.4,.583l2.707,2.707Z" />
          </svg>
          <span>Published</span>
        </button>
        <button
          className={styles.button}
          onClick={handleClick}
          onMouseEnter={() => setHoverText("dispatcher")}
          onMouseLeave={() => setHoverText("")}
          disabled={!env}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="m8,6.5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm-1.5,8.5c-.828,0-1.5.672-1.5,1.5s.672,1.5,1.5,1.5,1.5-.672,1.5-1.5-.672-1.5-1.5-1.5Zm0-5c-.828,0-1.5.672-1.5,1.5s.672,1.5,1.5,1.5,1.5-.672,1.5-1.5-.672-1.5-1.5-1.5ZM20.5,0H3.5C1.57,0,0,1.57,0,3.5v19.5h10.275c-.962-1.038-1.551-2.075-1.817-2.613l-.191-.387H3V3.5c0-.276.224-.5.5-.5h17c.276,0,.5.224.5.5v10.432c1.276.64,2.267,1.52,3,2.372V3.5c0-1.93-1.57-3.5-3.5-3.5Zm-1.5,5h-9v3h9v-3Zm-9,8h9v-3h-9v3Zm13.75,6.5c-.577,1.165-2.592,4.5-6.75,4.5s-6.175-3.338-6.75-4.5c.577-1.165,2.592-4.5,6.75-4.5s6.173,3.334,6.75,4.5Zm-4.75,0c0-1.105-.895-2-2-2s-2,.895-2,2,.895,2,2,2,2-.895,2-2Z" />
          </svg>
          <span>Dispatcher</span>
        </button>
      </div>
    </div>
  );
};

export default Popup;
