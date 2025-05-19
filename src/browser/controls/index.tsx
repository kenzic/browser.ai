/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect } from 'react';

import cx from 'classnames';
import useConnect from './use-connect';
import * as action from './actions';
import {
  IconClose,
  IconLeft,
  IconLoading,
  IconPlus,
  IconReload,
  IconRight,
} from './components/icons';

import '../global.css';
import { TabID } from '../types';

// eslint-disable-next-line import/prefer-default-export
export function Control() {
  const addressBarRef = React.useRef<HTMLInputElement>(null);
  const { tabs, tabIDs, activeID } = useConnect({
    onTabsUpdate: (value) => {
      console.log('onTabsUpdate', value);
    },
    onTabActive: (value) => {
      console.log('onTabActive', value);
    },
  });

  const { url, href, canGoForward, canGoBack, isLoading } =
    tabs[activeID as TabID] || {};

  const onUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sync to tab config
    const v = e.target.value;
    action.sendChangeURL(v);
  };

  const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode !== 13) return;
    const value = (e.target as HTMLInputElement).value.trim();
    if (!value) return;

    let hrefValue = value;
    if (!/^.*?:\/\//.test(value)) {
      hrefValue = `http://${value}`;
    }
    action.sendEnterURL(hrefValue);
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

  const focusAddressBar = () => {
    if (addressBarRef.current) {
      addressBarRef.current.focus();
      addressBarRef.current.select();
    }
  };

  const onAddressBarBlur = () => {
    if (addressBarRef.current) {
      addressBarRef.current.blur();
      // FIXME: this breaks alias urls
      addressBarRef.current.value = href || '';
    }
  };

  useEffect(() => {
    const destory = window.browserai.controls.onFocusAddressBar(() => {
      focusAddressBar();
    });
    return () => {
      destory();
    };
  }, []);

  return (
    <div className="h-screen pt-2 overflow-hidden select-none bg-gradient-to-tl from-purple-400 to-teal-500">
      <div className="flex items-center h-[28px] ml-[90px] mr-[32px] overflow-auto">
        {tabIDs.map((id) => {
          // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
          const { title, isLoading, favicon } = tabs[id] || {};
          return (
            <div
              key={id}
              className={cx(
                'tab group relative flex-1 flex items-center p-1.5 pl-3.5 pr-2.5 max-w-[185px]',
                'cursor-default',
                id === activeID ? 'h-full rounded-t-md bg-gray-50' : '',
              )}
              onClick={() => switchTab(id)}
            >
              {isLoading ? (
                <IconLoading className="size-3" />
              ) : (
                !!favicon && <img src={favicon} width="12" alt="" />
              )}
              <div className="flex-grow flex mx-[22px] ml-[10px] overflow-hidden">
                <div
                  className={cx(
                    'flex-shrink-0 text-xs ',
                    id !== activeID ? 'hover:text-gray-600' : '',
                  )}
                >
                  {title}
                </div>
              </div>
              <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div
                  className="flex justify-center items-center w-[22px] h-[22px] p-[3px] mt-[2px] rounded-full text-[10px] hover:bg-gray-200"
                  onClick={(e) => close(e, id)}
                >
                  <IconClose />
                </div>
              </div>
            </div>
          );
        })}
        <span className="ml-[16px]" onClick={newTab}>
          <IconPlus className="size-4" />
        </span>
      </div>
      <div className="px-[18px] py-[4px] bg-gray-50 border-slate-300 border-b-2">
        <div className="flex items-center address-bar">
          <div className="flex-shrink-0 flex justify-evenly w-[118px] mr-[18px]">
            <div
              className={cx(
                'action flex justify-center items-center w-9 h-9 rounded-full text-lg',
                !canGoBack
                  ? 'text-gray-200'
                  : 'hover:bg-gray-200 text-gray-800',
              )}
              onClick={canGoBack ? action.sendGoBack : undefined}
            >
              <IconLeft />
            </div>
            <div
              className={cx(
                'action flex justify-center items-center w-9 h-9 rounded-full text-lg',
                !canGoForward
                  ? 'text-gray-300'
                  : 'hover:bg-gray-200 text-gray-800',
              )}
              onClick={canGoForward ? action.sendGoForward : undefined}
            >
              <IconRight />
            </div>
            <div
              className={cx(
                'action flex justify-center items-center w-9 h-9 rounded-full text-gray-800 text-lg hover:bg-gray-200',
              )}
              onClick={isLoading ? action.sendStop : action.sendReload}
            >
              {isLoading ? <IconClose /> : <IconReload />}
            </div>
          </div>
          <input
            className="w-full h-8 px-3 py-1 border border-gray-300 rounded bg-gray-100 outline-none text-xs focus:bg-white"
            value={url || ''}
            ref={addressBarRef}
            title="Address Bar"
            onBlur={onAddressBarBlur}
            placeholder="Address"
            onChange={onUrlChange}
            onKeyDown={onPressEnter}
          />
        </div>
      </div>
    </div>
  );
}
