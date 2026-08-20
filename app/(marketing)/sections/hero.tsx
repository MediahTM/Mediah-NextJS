"use client";

import { buttonVariants } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Hero = () => {
    return (
        <div className="md:px-12 sm:px-6 px-4">
            <div className="max-w-6xl w-full py-12 md:py-24 lg:py-32 xl:py-[12vw] mx-auto">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-6">
                        <header className="sm:text-left text-center">
                            <h1 className="lg:leading-tighter text-3xl font-bold mb-1 tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                                Mediah - Free Cloud Storage Forever
                            </h1>
                            <p className="mx-auto mt-2 max-w-[700px] text-muted-foreground md:text-xl">
                                Get started by logging in with Discord and take advantage of <span className="text-primary">500GB</span> of completely free cloud storage!
                            </p>
                        </header>
                        <div className="flex sm:justify-start justify-center items-center gap-4">
                            <motion.a
                                href={'/sign-in'}
                                className={`${buttonVariants({ variant: "default", size: "lg" })} flex items-center gap-1.5`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                Get Started
                                <ArrowRight width={20} height={20} />
                            </motion.a>
                            <motion.a
                                href={"#features"}
                                className={buttonVariants({ variant: "outline", size: "lg" })}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                Features
                            </motion.a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero