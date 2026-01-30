import RenameDialog from '@/components/dialogs/rename/rename-dialog';
import React from 'react'
import { Dropdown } from '@/types/dropdown';
import { GeneralProps } from '@/types/general-props';
import ExportDialog from '@/components/dialogs/export/export-dialog';
import InfoDialog from '../dialogs/info/info-dialog';
import MoveDialog from '../dialogs/move/move-dialog';

export type DialogConfig = {
    key: keyof Dropdown["dialogs"];
    Component: React.FC<any>;
    extraProps: { [key: string]: any };
}

const DropdownDialogs = ({ dropdown, setDropdown }: Pick<GeneralProps, "dropdown" | "setDropdown">) => {
    const dialogConfigs: DialogConfig[] = [
        {
            key: "rename",
            Component: RenameDialog,
            extraProps: {},
        },
        {
            key: "export",
            Component: ExportDialog,
            extraProps: {},
        },
        {
            key: "info",
            Component: InfoDialog,
            extraProps: { items: dropdown.items },
        },
        {
            key: "move",
            Component: MoveDialog,
            extraProps: { items: dropdown.items },
        }
    ];
    return (
        <>
            {dialogConfigs.map((dialogConfig) => {
                const Dialog = dialogConfig.Component;
                return (
                    <Dialog
                        key={dialogConfig.key}
                        open={dropdown.dialogs[dialogConfig.key]}
                        setOpen={(value: boolean | ((prevState: boolean) => boolean)) => {
                            setDropdown((prev) => ({
                                ...prev,
                                dialogs: {
                                    ...prev.dialogs,
                                    [dialogConfig.key]: typeof value === 'function' ? value(prev.dialogs[dialogConfig.key]) : value,
                                },
                            }));
                        }}
                        item={dropdown.items[0]}
                        {...dialogConfig.extraProps}
                    />
                );
            })}
        </>
    )
}

export default DropdownDialogs