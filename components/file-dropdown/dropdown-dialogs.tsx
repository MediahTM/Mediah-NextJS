import RenameDialog from '@/components/dialogs/rename/rename-dialog';
import React from 'react'
import { Dropdown } from '@/types/dropdown';
import { GeneralProps } from '@/types/general-props';
import ExportDialog from '@/components/dialogs/export/export-dialog';
import ShareDialog from '@/components/dialogs/share/share-dialog';

export type DialogConfig = {
    key: keyof Dropdown["dialogs"];
    Component: React.FC<any>;
    extraProps: { [key: string]: any };
}

const DropdownDialogs = ({ dropdown, setDropdown, setFiles }: Pick<GeneralProps, "setFiles" | "dropdown" | "setDropdown">) => {
    const dialogConfigs: DialogConfig[] = [
        {
            key: "rename",
            Component: RenameDialog,
            extraProps: { setFiles },
        },
        {
            key: "export",
            Component: ExportDialog,
            extraProps: {},
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
                        file={dropdown.items[0]}
                        {...dialogConfig.extraProps}
                    />
                );
            })}
        </>
    )
}

export default DropdownDialogs