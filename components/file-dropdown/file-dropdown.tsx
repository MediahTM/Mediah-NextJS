import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { defaultOptions } from './default-dropdown-options';
import { GeneralProps } from '@/types/general-props';

export type FileDropdownProps = Pick<GeneralProps, "items" | "setFiles" | "shares" | "setShares" | "setStatusBar" | "dropdown" | "setDropdown"> & {
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    gridRef?: React.RefObject<AgGridReact>,
    children?: React.ReactNode,
    customOptions?: FileDropdownItem[]
}

export type FileDropdownItemFunctionInput = Pick<GeneralProps, "items" | "setFiles" | "shares" | "setShares" | "setStatusBar" | "dropdown" | "setDropdown"> & {
    gridRef?: React.RefObject<AgGridReact>
}

export type FileDropdownItem = {
    separator?: false,
    label: (props?: FileDropdownItemFunctionInput) => string,
    icon: (props?: FileDropdownItemFunctionInput) => React.ReactNode,
    enabled: (props: FileDropdownItemFunctionInput) => boolean,
    onClick: (props: FileDropdownItemFunctionInput) => void | Promise<void>
} | {
    separator: true,
    dependencies: string[]
}

const FileDropdown = ({ open, onOpenChange, setStatusBar, setFiles, gridRef, children, items, shares, setShares, dropdown, setDropdown, customOptions }: FileDropdownProps) => {
    const options = customOptions ?? defaultOptions
    const props = { items, setFiles, shares, setShares, setStatusBar, gridRef, dropdown, setDropdown }
    return (
        <DropdownMenu open={open ?? undefined} onOpenChange={onOpenChange ?? undefined}>
            <DropdownMenuTrigger asChild={Boolean(children)}>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[150px]'>
                {options.map((option, index) => (
                    <React.Fragment key={index}>
                        {option.separator && option.dependencies && !option.dependencies.some((dependency) => {
                            const option = options.find(o => "label" in o && o.label(props) === dependency)
                            return !(option && "enabled" in option && option.enabled(props))
                        }) && <DropdownMenuSeparator />}
                        {!option.separator && option.enabled(props) && <React.Fragment>
                            <DropdownMenuItem
                                onClick={() => {
                                    option.onClick(props);
                                }}
                            >
                                {option.icon(props)}
                                {option.label(props)}
                            </DropdownMenuItem>
                        </React.Fragment>}
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default FileDropdown