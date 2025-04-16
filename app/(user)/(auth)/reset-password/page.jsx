'use client';
import React, { Suspense } from 'react';
import ResetPassword from './reset-pass';

const page = () => {
  return (
    <div>
      <Suspense>
        <ResetPassword></ResetPassword>
      </Suspense>
    </div>
  );
};

export default page;