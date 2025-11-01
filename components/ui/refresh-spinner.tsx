import { useFiles } from '@/utils/files-context';
import { RefreshCcwIcon } from 'lucide-react'
import { motion, useAnimation, useMotionValue } from 'motion/react';
import React, { useEffect } from 'react'

const RefreshSpinner = React.forwardRef<React.ComponentProps<"div">>(({ ...props }, ref) => {
    const { refetching, loading } = useFiles();
    const rotate = useMotionValue(0);
    const divControls = useAnimation();
    useEffect(() => {
        if (refetching && !loading) {
            divControls.set({ rotate: rotate.get() });
            divControls.start({
                rotate: rotate.get() + 360,
                transition: {
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear"
                }
            });
        } else {
            divControls.stop();
        }
    }, [refetching, loading]);
    return (
        <motion.div ref={ref as React.Ref<HTMLDivElement>} {...props} animate={divControls} style={{ rotate }}>
            <RefreshCcwIcon />
        </motion.div>
    )
})

export default RefreshSpinner