import { ControllerFieldState } from 'react-hook-form';

interface InputErrorMessageProps {
  fieldState: ControllerFieldState;
}
const InputErrorMessage = ({ fieldState }: InputErrorMessageProps) => {
  return <div className="mt-0.5 h-4 text-red-500">{fieldState.error?.message}</div>;
};

export default InputErrorMessage;
