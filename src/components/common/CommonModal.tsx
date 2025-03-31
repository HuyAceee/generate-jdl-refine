import { Modal, ModalProps, Button } from 'antd';
import React from 'react';
import './common-modal.css';

type CommonModalProps = ModalProps & {
  hiddenClose?: boolean;
};

const CommonModal: React.FC<CommonModalProps> = ({
  footer,
  onOk,
  onCancel,
  okText,
  cancelText,
  hiddenClose,
  ...props
}) => {
  const finalFooter =
    footer ??
    (onOk ?? onCancel ? (
      <div className="flex w-full justify-center">
        {!hiddenClose && onCancel && (
          <Button key="cancel" onClick={onCancel} className="mr-2">
            {cancelText ?? 'Hủy'}
          </Button>
        )}
        {onOk && (
          <Button key="save" className="bg-green-500 text-white" onClick={onOk}>
            {okText ?? 'Đồng ý'}
          </Button>
        )}
      </div>
    ) : null);
  return (
    <Modal
      {...props}
      centered
      footer={finalFooter}
      onCancel={onCancel}
      title={<div className="w-full text-center">{props.title}</div>}
    >
      <div className="mb-4">{props.children}</div>
    </Modal>
  );
};

export default CommonModal;
