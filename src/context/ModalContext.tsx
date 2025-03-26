import { ModalProps } from 'antd';
import React, { createContext, useContext, useState } from 'react';

import CommonModal from '../components/common/modal/CommonModal';

interface ModalContextProps {
  openModal: (content: React.ReactNode, props?: ModalProps & { hiddenClose?: boolean }) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalProps, setModalProps] = useState<ModalProps | undefined>(undefined);

  const openModal = (content: React.ReactNode, props?: ModalProps & { hiddenClose?: boolean }) => {
    setModalContent(content);
    setModalProps(props);
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setModalContent(null);
    setModalProps(undefined);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <CommonModal open={isVisible} onCancel={closeModal} footer={null} {...modalProps}>
        {modalContent}
      </CommonModal>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
