import { useState } from "react";

export const useMultiModal = () => {
    const [modalType, setModalType] = useState<null | "add" | "update" | "changePass" | "find_history" | "find_history_point">(null);

    const openModal = (type: "add" | "update" | "changePass" | "find_history" | "find_history_point") => setModalType(type);
    const closeModal = () => setModalType(null);

    return {
        isOpen: modalType !== null,
        modalType,
        openModal,
        closeModal,
    };
};