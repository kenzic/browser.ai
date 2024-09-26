import React from "react";

import cx from "classnames";
import useConnect from "./use-connect";
import * as action from "./actions";
import {
  IconClose,
  IconLeft,
  IconLoading,
  IconPlus,
  IconReload,
  IconRight,
} from "./components/icons";

import "./components/style.css";
import "../global.css";
import { TabID } from "../types";

export function Control() {
  const { tabs, tabIDs, activeID } = useConnect();

  const { url, canGoForward, canGoBack, isLoading } =
    tabs[activeID as TabID] || {};

  const onUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sync to tab config
    const v = e.target.value;
    action.sendChangeURL(v);
  };

  const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode !== 13) return;
    const v = (e.target as HTMLInputElement).value.trim();
    if (!v) return;

    let href = v;
    if (!/^.*?:\/\//.test(v)) {
      href = `http://${v}`;
    }
    action.sendEnterURL(href);
  };
  const close = (e: React.MouseEvent<HTMLDivElement>, id: TabID) => {
    e.stopPropagation();
    action.sendCloseTab(id);
  };
  const newTab = () => {
    action.sendNewTab();
  };
  const switchTab = (id: TabID) => {
    action.sendSwitchTab(id);
  };

  return (
    <div className="h-screen pt-2 overflow-hidden select-none bg-gradient-to-tl from-purple-400 to-teal-500">
      <div className="flex items-center h-[28px] ml-[90px] mr-[32px] overflow-auto">
        <>
          {tabIDs.map((id) => {
            // eslint-disable-next-line no-shadow
            const { title, isLoading, favicon } = tabs[id] || {};
            return (
              <div
                key={id}
                className={cx("tab", { active: id === activeID })}
                onClick={() => switchTab(id)}
              >
                {isLoading ? (
                  <IconLoading className="size-3" />
                ) : (
                  !!favicon && <img src={favicon} width="12" alt="" />
                )}

                <div className="flex-grow flex mx-[5px] ml-[10px] overflow-hidden">
                  <div className="flex-shrink-0 text-sm">{title}</div>
                </div>
                <div
                  className="flex justify-center items-center w-[20px] h-[20px] p-[5px] mt-[2px] rounded-full text-[10px] hover:bg-gray-300"
                  onClick={(e) => close(e, id)}
                >
                  <IconClose />
                </div>
              </div>
            );
          })}
          <span className="ml-[10px]" onClick={newTab}>
            <IconPlus className="size-4" />
          </span>
        </>
      </div>
      <div className="px-[18px] py-[10px] bg-white border-slate-300 border-b-2">
        <div className="flex items-center address-bar">
          <div className="flex-shrink-0 flex justify-evenly w-[118px] mr-[18px]">
            <div
              className={cx("action", { disabled: !canGoBack })}
              onClick={canGoBack ? action.sendGoBack : undefined}
            >
              <IconLeft />
            </div>
            <div
              className={cx("action", { disabled: !canGoForward })}
              onClick={canGoForward ? action.sendGoForward : undefined}
            >
              <IconRight />
            </div>
            <div
              className={cx("action")}
              onClick={isLoading ? action.sendStop : action.sendReload}
            >
              {isLoading ? <IconClose /> : <IconReload />}
            </div>
          </div>
          <input
            className="w-full h-8 px-3 py-1 border border-gray-300 rounded bg-gray-200 outline-none text-xs focus:bg-white"
            value={url || ""}
            title="Address Bar"
            placeholder="Address"
            onChange={onUrlChange}
            onKeyDown={onPressEnter}
          />
        </div>
      </div>
    </div>
  );
}
