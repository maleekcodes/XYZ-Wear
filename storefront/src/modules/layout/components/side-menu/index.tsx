"use client"

import { Popover, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

const SideMenuItems = {
  Home: "/",
  "Physical Form": "/store",
  "Digital Form": "/digital",
  OOO: "/private-expressions",
  Journal: "/journal",
  "Try-on": "/virtual-try-on",
  Search: "/search",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = ({
  regions,
  variant = "light",
}: {
  regions: HttpTypes.StoreRegion[] | null
  variant?: "light" | "digital" | "ooo"
}) => {
  const toggleState = useToggleState()
  const menuBtn =
    variant === "digital"
      ? "relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none text-neutral-300 hover:text-white"
      : variant === "ooo"
        ? "relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none text-white hover:text-white/90"
        : "relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className={menuBtn}
                >
                  Menu
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <Popover.Panel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className={`flex flex-col h-full rounded-rounded justify-between p-6 ${variant === "ooo" ? "bg-[rgba(19,17,15,0.92)] backdrop-blur-2xl" : "bg-[rgba(3,7,18,0.5)]"}`}
                  >
                    <div
                      className={clx(
                        "flex justify-end",
                        variant === "ooo" && "text-white"
                      )}
                      id="xmark"
                    >
                      <button data-testid="close-menu-button" onClick={close}>
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-6 items-start justify-start">
                      {Object.entries(SideMenuItems).map(([name, href]) => {
                        return (
                          <li key={name}>
                            <LocalizedClientLink
                              href={href}
                              className={clx(
                                "text-3xl leading-10",
                                variant === "ooo"
                                  ? "text-white hover:text-white/80"
                                  : "hover:text-ui-fg-disabled"
                              )}
                              onClick={close}
                              data-testid={`${name.toLowerCase()}-link`}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      <div
                        className="flex justify-between"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={toggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            toggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} Medusa Store. All rights
                        reserved.
                      </Text>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
