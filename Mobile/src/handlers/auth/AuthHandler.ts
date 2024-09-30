import { useState } from "react";
import { useAuth } from "../../hooks";

export default function AuthHandler() {
  //
  const [visible, setVisible] = useState(false);

  //default credentials for Testing purpose
  const [fdata, setFdata] = useState({
    email: "testaccount5@tcg.com",
    password: "Test@123",
  });

  const { login, signUp, isLoading } = useAuth();

  //handle Text change and update appropraite formdata fields
  const handleTextChange = (text: string, fieldName: string) => {
    setFdata((fdata) => {
      return { ...fdata, [fieldName]: text };
    });
  };

  //handle Form Submitted
  const onSubmit = () => (visible ? signUp(fdata) : login(fdata));
  return {
    fdata,
    visible,
    isLoading,
    onSubmit,
    setVisible,
    handleTextChange,
  };
}
