import { Suspense } from "react";
import VerifyOtp from "../verify/Page";
import Loading from "./Loading";
const VerifyPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOtp />
    </Suspense>
  );
};

export default VerifyPage;
