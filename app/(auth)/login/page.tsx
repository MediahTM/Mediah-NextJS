"use client";

import LoginCard from '@/components/login-card';

const LoginPage = () => {
    return (
        <LoginCard callback={process.env.BASEPATH!} />
    )
}

export default LoginPage;