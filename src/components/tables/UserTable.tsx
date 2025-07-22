import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { useMultiModal } from "@/hooks/useMultiModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Switch from "../form/switch/Switch";
import userServices from '@/services/userServices';
import { getSiteSystem } from "@/utils/storage";
import { information } from '@/utils/info.const';
import { formatDateTimeVN } from "@/utils/formatDateTime";
import Pagination from "@/layout/Pagination";
import { 
    UserStatus, 
    UserRole, 
    User, 
    getStatusLabel, 
    isActiveStatus, 
    toggleStatus 
} from "@/types/user";

// Inline SVG Icons Components để tránh vấn đề SVGR
const EyeIcon = ({ className = "" }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z" />
    </svg>
);

const EyeCloseIcon = ({ className = "" }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z" />
    </svg>
);

const PlusIcon = ({ className = "" }: { className?: string }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M5.25012 3C5.25012 2.58579 5.58591 2.25 6.00012 2.25C6.41433 2.25 6.75012 2.58579 6.75012 3V5.25012L9.00034 5.25012C9.41455 5.25012 9.75034 5.58591 9.75034 6.00012C9.75034 6.41433 9.41455 6.75012 9.00034 6.75012H6.75012V9.00034C6.75012 9.41455 6.41433 9.75034 6.00012 9.75034C5.58591 9.75034 5.25012 9.41455 5.25012 9.00034L5.25012 6.75012H3C2.58579 6.75012 2.25 6.41433 2.25 6.00012C2.25 5.58591 2.58579 5.25012 3 5.25012H5.25012V3Z" fill="currentColor" />
    </svg>
);

const UserCircleIcon = ({ className = "" }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"/>
    </svg>
);

const PencilIcon = ({ className = "" }: { className?: string }) => (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M17.0911 3.53206C16.2124 2.65338 14.7878 2.65338 13.9091 3.53206L5.6074 11.8337C5.29899 12.1421 5.08687 12.5335 4.99684 12.9603L4.26177 16.445C4.20943 16.6931 4.286 16.9508 4.46529 17.1301C4.64458 17.3094 4.90232 17.3859 5.15042 17.3336L8.63507 16.5985C9.06184 16.5085 9.45324 16.2964 9.76165 15.988L18.0633 7.68631C18.942 6.80763 18.942 5.38301 18.0633 4.50433L17.0911 3.53206ZM14.9697 4.59272C15.2626 4.29982 15.7375 4.29982 16.0304 4.59272L17.0027 5.56499C17.2956 5.85788 17.2956 6.33276 17.0027 6.62565L16.1043 7.52402L14.0714 5.49109L14.9697 4.59272ZM13.0107 6.55175L6.66806 12.8944C6.56526 12.9972 6.49455 13.1277 6.46454 13.2699L5.96704 15.6283L8.32547 15.1308C8.46772 15.1008 8.59819 15.0301 8.70099 14.9273L15.0436 8.58468L13.0107 6.55175Z" fill="currentColor" />
    </svg>
);

const TrashBinIcon = ({ className = "" }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.54142 3.7915C6.54142 2.54886 7.54878 1.5415 8.79142 1.5415H11.2081C12.4507 1.5415 13.4581 2.54886 13.4581 3.7915V4.0415H15.6252H16.666C17.0802 4.0415 17.416 4.37729 17.416 4.7915C17.416 5.20572 17.0802 5.5415 16.666 5.5415H16.3752V8.24638V13.2464V16.2082C16.3752 17.4508 15.3678 18.4582 14.1252 18.4582H5.87516C4.63252 18.4582 3.62516 17.4508 3.62516 16.2082V13.2464V8.24638V5.5415H3.3335C2.91928 5.5415 2.5835 5.20572 2.5835 4.7915C2.5835 4.37729 2.91928 4.0415 3.3335 4.0415H4.37516H6.54142V3.7915ZM14.8752 13.2464V8.24638V5.5415H13.4581H12.7081H7.29142H6.54142H5.12516V8.24638V13.2464V16.2082C5.12516 16.6224 5.46095 16.9582 5.87516 16.9582H14.1252C14.5394 16.9582 14.8752 16.6224 14.8752 16.2082V13.2464ZM8.04142 4.0415H11.9581V3.7915C11.9581 3.37729 11.6223 3.0415 11.2081 3.0415H8.79142C8.37721 3.0415 8.04142 3.37729 8.04142 3.7915V4.0415ZM8.3335 7.99984C8.74771 7.99984 9.0835 8.33562 9.0835 8.74984V13.7498C9.0835 14.1641 8.74771 14.4998 8.3335 14.4998C7.91928 14.4998 7.5835 14.1641 7.5835 13.7498V8.74984C7.5835 8.33562 7.91928 7.99984 8.3335 7.99984ZM12.4168 8.74984C12.4168 8.33562 12.081 7.99984 11.6668 7.99984C11.2526 7.99984 10.9168 8.33562 10.9168 8.74984V13.7498C10.9168 14.1641 11.2526 14.4998 11.6668 14.4998C12.081 14.4998 12.4168 14.1641 12.4168 13.7498V8.74984Z" fill="currentColor" />
    </svg>
);

const LockIcon = ({ className = "" }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M10.6252 13.9582C10.6252 13.613 10.3453 13.3332 10.0002 13.3332C9.65498 13.3332 9.37516 13.613 9.37516 13.9582V15.2082C9.37516 15.5533 9.65498 15.8332 10.0002 15.8332C10.3453 15.8332 10.6252 15.5533 10.6252 15.2082V13.9582Z" fill="#667085" />
        <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 1.6665C7.58392 1.6665 5.62516 3.62526 5.62516 6.0415V7.604H4.5835C3.54796 7.604 2.7085 8.44347 2.7085 9.479V16.4578C2.7085 17.4933 3.54796 18.3328 4.5835 18.3328H15.4168C16.4524 18.3328 17.2918 17.4933 17.2918 16.4578V9.479C17.2918 8.44347 16.4524 7.604 15.4168 7.604H14.3752V6.0415C14.3752 3.62526 12.4164 1.6665 10.0002 1.6665ZM13.1252 6.0415V7.604H6.87516V6.0415C6.87516 4.31561 8.27427 2.9165 10.0002 2.9165C11.7261 2.9165 13.1252 4.31561 13.1252 6.0415ZM4.5835 8.854C4.23832 8.854 3.9585 9.13383 3.9585 9.479V16.4578C3.9585 16.8029 4.23832 17.0828 4.5835 17.0828H15.4168C15.762 17.0828 16.0418 16.8029 16.0418 16.4578V9.479C16.0418 9.13383 15.762 8.854 15.4168 8.854H4.5835Z" fill="currentColor" />
    </svg>
);

const UserIcon = ({ className = "" }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M8.0254 6.17845C8.0254 4.90629 9.05669 3.875 10.3289 3.875C11.601 3.875 12.6323 4.90629 12.6323 6.17845C12.6323 7.45061 11.601 8.48191 10.3289 8.48191C9.05669 8.48191 8.0254 7.45061 8.0254 6.17845ZM10.3289 2.375C8.22827 2.375 6.5254 4.07786 6.5254 6.17845C6.5254 8.27904 8.22827 9.98191 10.3289 9.98191C12.4294 9.98191 14.1323 8.27904 14.1323 6.17845C14.1323 4.07786 12.4294 2.375 10.3289 2.375ZM8.92286 11.03C5.7669 11.03 3.2085 13.5884 3.2085 16.7444V17.0333C3.2085 17.4475 3.54428 17.7833 3.9585 17.7833C4.37271 17.7833 4.7085 17.4475 4.7085 17.0333V16.7444C4.7085 14.4169 6.59533 12.53 8.92286 12.53H11.736C14.0635 12.53 15.9504 14.4169 15.9504 16.7444V17.0333C15.9504 17.4475 16.2861 17.7833 16.7004 17.7833C17.1146 17.7833 17.4504 17.4475 17.4504 17.0333V16.7444C17.4504 13.5884 14.8919 11.03 11.736 11.03H8.92286Z" fill="currentColor" />
    </svg>
);

const CheckCircleIcon = ({ className = "" }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M3.55078 12C3.55078 7.33417 7.3332 3.55176 11.999 3.55176C16.6649 3.55176 20.4473 7.33417 20.4473 12C20.4473 16.6659 16.6649 20.4483 11.999 20.4483C7.3332 20.4483 3.55078 16.6659 3.55078 12ZM11.999 2.05176C6.50477 2.05176 2.05078 6.50574 2.05078 12C2.05078 17.4943 6.50477 21.9483 11.999 21.9483C17.4933 21.9483 21.9473 17.4943 21.9473 12C21.9473 6.50574 17.4933 2.05176 11.999 2.05176ZM15.5126 10.6333C15.8055 10.3405 15.8055 9.86558 15.5126 9.57269C15.2197 9.27979 14.7448 9.27979 14.4519 9.57269L11.1883 12.8364L9.54616 11.1942C9.25327 10.9014 8.7784 10.9014 8.4855 11.1942C8.19261 11.4871 8.19261 11.962 8.4855 12.2549L10.6579 14.4273C10.7986 14.568 10.9894 14.647 11.1883 14.647C11.3872 14.647 11.578 14.568 11.7186 14.4273L15.5126 10.6333Z" fill="currentColor" />
    </svg>
);

const CloseIcon = ({ className = "" }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z" fill="currentColor" />
    </svg>
);

const BellIcon = ({ className = "" }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
    </svg>
);

const CheckLineIcon = ({ className = "" }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M13.4017 4.35986L6.12166 11.6399L2.59833 8.11657" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ListIcon = ({ className = "" }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5001C19.7427 20.75 20.7501 19.7426 20.7501 18.5V5.5C20.7501 4.25736 19.7427 3.25 18.5001 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H18.5001C18.9143 4.75 19.2501 5.08579 19.2501 5.5V18.5C19.2501 18.9142 18.9143 19.25 18.5001 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V5.5ZM6.25005 9.7143C6.25005 9.30008 6.58583 8.9643 7.00005 8.9643L17 8.96429C17.4143 8.96429 17.75 9.30008 17.75 9.71429C17.75 10.1285 17.4143 10.4643 17 10.4643L7.00005 10.4643C6.58583 10.4643 6.25005 10.1285 6.25005 9.7143ZM6.25005 14.2857C6.25005 13.8715 6.58583 13.5357 7.00005 13.5357H17C17.4143 13.5357 17.75 13.8715 17.75 14.2857C17.75 14.6999 17.4143 15.0357 17 15.0357H7.00005C6.58583 15.0357 6.25005 14.6999 6.25005 14.2857Z" fill="currentColor" />
    </svg>
);

const AlertIcon = ({ className = "" }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M13.9497 3.875C13.0836 2.375 10.9186 2.375 10.0525 3.875L2.54699 16.875C1.68096 18.375 2.76349 20.25 4.49554 20.25H19.5067C21.2387 20.25 22.3212 18.375 21.4552 16.875L13.9497 3.875ZM11.3516 4.625C11.6403 4.125 12.3619 4.125 12.6506 4.625L20.1562 17.625C20.4448 18.125 20.084 18.75 19.5067 18.75H4.49554C3.91819 18.75 3.55735 18.125 3.84603 17.625L11.3516 4.625ZM12.0018 8.56075C12.416 8.56075 12.7518 8.89653 12.7518 9.31075V13.5303C12.7518 13.9445 12.416 14.2803 12.0018 14.2803C11.5876 14.2803 11.2518 13.9445 11.2518 13.5303V9.31075C11.2518 8.89653 11.5876 8.56075 12.0018 8.56075ZM11.0009 16.0803C11.0009 15.528 11.4486 15.0803 12.0009 15.0803H12.0016C12.5539 15.0803 13.0016 15.528 13.0016 16.0803C13.0016 16.6326 12.5539 17.0803 12.0016 17.0803H12.0009C11.4486 17.0803 11.0009 16.6326 11.0009 16.0803Z" fill="currentColor" />
    </svg>
);

// Initial form state for adding/editing users
const initialForm = {
    username: '',
    password: '',
    role: 'user', // Default role for new user
    status: UserStatus.ACTIVE, // Default status for new user
    site: getSiteSystem(),
};

// User data type based on API response (use the imported User type)
type UserType = User;

// Enhanced Skeleton loader component
const TableSkeleton = () => (
    <>
        {[...Array(8)].map((_, index) => (
            <TableRow key={index} className="animate-pulse">
                <TableCell className="px-6 py-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-shimmer"></div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-shimmer"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-24"></div>
                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-16"></div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-shimmer w-28"></div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="flex justify-center">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-shimmer w-16"></div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-16"></div>
                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-20"></div>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                            <div className="space-y-1">
                                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-16"></div>
                                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-20"></div>
                            </div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-shimmer w-20"></div>
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-shimmer w-16"></div>
                    </div>
                </TableCell>
            </TableRow>
        ))}
    </>
);

// Enhanced Status Badge Component
const StatusBadge = ({ status, isLoading = false }: { status: string; isLoading?: boolean }) => {
    const isActive = isActiveStatus(status);
    return (
        <div className="flex items-center justify-center">
            <span className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                ${isActive 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                    : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }
                ${isLoading ? 'opacity-50' : ''}
            `}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-emerald-500' : 'bg-red-500'} ${isLoading ? 'animate-pulse' : ''}`}></div>
                {getStatusLabel(status)}
            </span>
        </div>
    );
};

// Enhanced Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'superadmin':
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
        }
    };

    return (
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${getRoleColor(role)}`}>
            {information.role[role as keyof typeof information.role]}
        </span>
    );
};

// Enhanced Action Buttons Component
const ActionButtons = ({ onChangePassword, onDelete, loading }: { 
    onChangePassword: () => void; 
    onDelete: () => void; 
    loading?: boolean;
}) => (
    <div className="flex justify-center gap-2">
        <button
            onClick={onChangePassword}
            disabled={loading}
            className="group inline-flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <PencilIcon className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-12 transition-transform duration-200" />
            Đặt lại MK
        </button>
        <button
            onClick={onDelete}
            disabled={loading}
            className="group inline-flex items-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all duration-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <TrashBinIcon className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-12 transition-transform duration-200" />
            Xóa
        </button>
    </div>
);

export default function UserTable() {
    const [data, setData] = useState<UserType[]>([]);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState<string | null>(null);

    // State for search input to avoid re-fetching on every keystroke
    const [usernameInput, setUsernameInput] = useState('');

    // Filters state aligned with API query params
    const [filters, setFilters] = useState({
        username: '',
        role: '',
        status: '',
        page: 1,
        limit: 10,
    });

    // Pagination state from API metadata
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Reset error message when modal opens
    useEffect(() => {
        if (isOpen) {
            setError('');
        }
    }, [isOpen]);

    // Fetch users data from API based on filters
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                page: filters.page,
                limit: filters.limit,
                site: getSiteSystem(),
            };
            if (filters.username) params.username = filters.username;
            if (filters.role) params.role = filters.role;
            if (filters.status !== '') params.status = filters.status;

            const res = await userServices.getUser(params);

            if (res.success && res.data) {
                setData(res.data.data);
                setTotalItems(res.data.meta.total);
                setTotalPages(res.data.meta.totalPages);
            } else {
                toast.error(res.message || "Lấy danh sách người dùng thất bại.");
                setData([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (err) {
            toast.error("Lấy danh sách người dùng bị lỗi!");
            console.error("Fetch users error:", err);
            setData([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Re-fetch users when filters change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle create or change password
    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            if (modalType === "add") {
                const { username, password, site, role, status } = form;
                const payload = { username, password, site, role, status };
                res = await userServices.postUser(payload);
                if (res.success) {
                    toast.success("Tạo người dùng thành công!");
                    closeModal();
                    fetchUsers();
                } else {
                    setError(res.message || 'Tạo người dùng thất bại.');
                }
            } else if (modalType?.trim() === "changePass") {
                const { password } = form;
                res = await userServices.changePasswordUser({ password }, editUserId);
                if (res.success) {
                    toast.success("Đổi mật khẩu thành công!");
                    closeModal();
                } else {
                    setError(res.message || 'Đổi mật khẩu thất bại.');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    // Handle status change specifically
    const handleStatusChange = async (userId: string, newStatus: string) => {
        const user = data.find(u => u._id === userId);
        if (!user) return;

        // Don't make API call if status is the same
        if (user.status === newStatus) return;

        await handleUpdateUser(userId, { status: newStatus });
    };

    // Handle role change specifically  
    const handleRoleChange = async (userId: string, newRole: string) => {
        const user = data.find(u => u._id === userId);
        if (!user) return;

        // Don't make API call if role is the same
        if (user.role === newRole) return;

        await handleUpdateUser(userId, { role: newRole });
    };

    // Generic function to update user details (role, status)
    const handleUpdateUser = async (userId: string, updateData: { role?: string; status?: string }) => {
        setUpdateLoading(userId);
        
        // Get current user data for rollback if needed
        const currentUser = data.find(user => user._id === userId);
        if (!currentUser) return;

        // Optimistic update - update UI immediately
        setData(prevData =>
            prevData.map(user => 
                user._id === userId 
                    ? { ...user, ...updateData } 
                    : user
            )
        );

        try {
            const res = await userServices.updateUser(userId, updateData);
            if (res.success) {
                // Update with server response data
                setData(prevData =>
                    prevData.map(user => (user._id === userId ? res.data : user))
                );
                
                // Show success message based on update type
                const updateType = updateData.status !== undefined ? 'trạng thái' : 'vai trò';
                toast.success(`Cập nhật ${updateType} thành công!`);
            } else {
                // Rollback to original state on failure
                setData(prevData =>
                    prevData.map(user => (user._id === userId ? currentUser : user))
                );
                toast.error(res.message || "Cập nhật thất bại.");
            }
        } catch (err: any) {
            // Rollback to original state on error
            setData(prevData =>
                prevData.map(user => (user._id === userId ? currentUser : user))
            );
            
            const errorMessage = err.response?.data?.message || "Cập nhật người dùng thất bại.";
            toast.error(errorMessage);
            console.error("Update user error:", err);
        } finally {
            setUpdateLoading(null);
        }
    };

    // Delete a user
    const deleteUser = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
        
        setUpdateLoading(id);
        try {
            const res = await userServices.deleteUser(id);
            if (res.success) {
                toast.success("Xóa người dùng thành công.");
                fetchUsers();
            } else {
                toast.error(res.message || 'Xóa người dùng thất bại.');
            }
        } catch (err) {
            toast.error('Xóa người dùng thất bại.');
        } finally {
            setUpdateLoading(null);
        }
    };

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCloseModal = () => {
        closeModal();
        setForm(initialForm);
    };

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, username: usernameInput, page: 1 }));
    };

    const clearFilters = () => {
        setUsernameInput('');
        setFilters({
            username: '',
            role: '',
            status: '',
            page: 1,
            limit: filters.limit,
        });
    };

    return (
        <>
            {/* Enhanced Container */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-2xl shadow-gray-500/10 dark:border-white/[0.08] dark:bg-gray-900/50 dark:shadow-black/20 backdrop-blur-sm">
                {/* Enhanced Header Section */}
                <div className="relative border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 px-8 py-6 dark:border-white/[0.08] dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                    <UserCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                                    Quản lý người dùng
                                </h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Tổng cộng <span className="font-semibold text-blue-600 dark:text-blue-400">{totalItems}</span> người dùng
                                </p>
                                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Đang hoạt động</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal("add")}
                            type="button"
                            className="group inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 border border-transparent rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                        >
                            <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                            Thêm người dùng mới
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>

                {/* Enhanced Filters and Search */}
                {/* 
                    Giao diện bộ lọc được làm đều các input, các trường input/select có cùng chiều cao, padding, border, font, và layout nhất quán.
                    Sử dụng grid chia đều các cột, nút bấm căn giữa hàng cuối cùng.
                */}
                <div className="p-8 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/30 to-transparent dark:border-white/[0.08] dark:from-gray-800/20">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        {/* Ô tìm kiếm */}
                        <div className="flex flex-col justify-end">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Tìm kiếm
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Nhập tên tài khoản để tìm kiếm..."
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 transition-all duration-200"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {/* Ô chọn vai trò */}
                        <div className="flex flex-col justify-end">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Vai trò
                                </span>
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all duration-200"
                            >
                                <option value="">Tất cả vai trò</option>
                                {Object.entries(information.role).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        {/* Ô chọn trạng thái */}
                        <div className="flex flex-col justify-end">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <BellIcon className="w-4 h-4" />
                                    Trạng thái
                                </span>
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all duration-200"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value={UserStatus.ACTIVE}>{getStatusLabel(UserStatus.ACTIVE)}</option>
                                <option value={UserStatus.INACTIVE}>{getStatusLabel(UserStatus.INACTIVE)}</option>
                            </select>
                        </div>
                        {/* Cột nút bấm */}
                        <div className="flex items-end gap-3">
                            <button
                                onClick={handleSearch}
                                className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Tìm kiếm
                            </button>
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                        {/* Nếu muốn thêm cột trống để căn đều, có thể thêm div ẩn ở đây */}
                        <div className="hidden xl:block"></div>
                        <div className="hidden xl:block"></div>
                    </div>
                </div>

                {/* Enhanced Table */}
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        <Table>
                            <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-sm">
                                <TableRow>
                                    {[
                                        { key: "stt", label: "STT", width: "w-20" },
                                        { key: "username", label: "Thông tin tài khoản", width: "min-w-48 text-left" },
                                        { key: "role", label: "Vai trò", width: "min-w-32" },
                                        { key: "status", label: "Trạng thái", width: "min-w-36" },
                                        { key: "datetime", label: "Ngày tạo / Cập nhật", width: "min-w-40" },
                                        { key: "actions", label: "Thao tác", width: "min-w-40" }
                                    ].map((header) => (
                                        <TableCell
                                            key={header.key}
                                            isHeader
                                            className={`px-8 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300 ${header.width}`}
                                        >
                                            {header.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody className="bg-white divide-y divide-gray-100/60 dark:bg-transparent dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableSkeleton />
                                ) : data.length > 0 ? (
                                    data.map((user, index) => (
                                        <TableRow 
                                            key={user._id}
                                            className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-300 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10"
                                        >
                                            <TableCell className="px-8 py-6 text-sm font-bold text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-center">
                                                    <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {(filters.page - 1) * filters.limit + index + 1}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center justify-start">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {user.username}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                            ID: {user._id.slice(-8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <select
                                                        name="role"
                                                        className="text-sm border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        disabled={updateLoading === user._id}
                                                    >
                                                        {Object.entries(information.role).map(([key, label]) => (
                                                            <option key={key} value={key}>
                                                                {label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6">
                                                <div className="flex justify-center items-center">
                                                    <div className="relative">
                                                        <Switch
                                                            label={getStatusLabel(user.status)}
                                                            checked={isActiveStatus(user.status)}
                                                            disabled={updateLoading === user._id}
                                                            onChange={(checked) => handleStatusChange(user._id, checked ? UserStatus.ACTIVE : UserStatus.INACTIVE)}
                                                            color="blue"
                                                        />
                                                        {updateLoading === user._id && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg">
                                                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-center">
                                                            {formatDateTimeVN(user.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-gray-200/60 dark:border-white/[0.05] pt-2">
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium  text-center">
                                                                {formatDateTimeVN(user.updatedAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6">
                                                <ActionButtons
                                                    loading={updateLoading === user._id}
                                                    onChangePassword={() => {
                                                        setEditUserId(user._id);
                                                        openModal("changePass");
                                                    }}
                                                    onDelete={() => deleteUser(user._id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-6">
                                                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center dark:from-gray-800 dark:to-gray-700">
                                                    <UserCircleIcon className="w-12 h-12 text-gray-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Không tìm thấy người dùng
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                                                        Không có người dùng nào phù hợp với tiêu chí tìm kiếm. Hãy thử thay đổi bộ lọc hoặc tạo người dùng mới.
                                                    </p>
                                                </div>
                                                                                <button
                                    onClick={() => openModal("add")}
                                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                >
                                    Tạo người dùng đầu tiên
                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Enhanced Pagination */}
                {!loading && data.length > 0 && (
                    <div className="bg-gradient-to-r from-white to-gray-50/50 px-8 py-6 border-t border-gray-200/60 dark:from-gray-900/50 dark:to-gray-800/30 dark:border-white/[0.08] backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Hiển thị</span>
                                <select
                                    name="limit"
                                    value={filters.limit}
                                    onChange={(e) => {
                                        setFilters((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }));
                                    }}
                                    className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    trong tổng số <span className="font-semibold text-blue-600 dark:text-blue-400">{totalItems}</span> kết quả
                                </span>
                            </div>

                            <Pagination
                                currentPage={filters.page}
                                totalPages={totalPages}
                                onPageChange={(page: number) =>
                                    setFilters((prev) => ({ ...prev, page }))
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Modal Form */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
                <div className="relative w-full max-w-[700px] bg-white rounded-3xl shadow-2xl dark:bg-gray-900 backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.08]">
                    {/* Enhanced Modal Header */}
                    <div className="flex items-center justify-between p-8 border-b border-gray-200/60 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                {modalType === "add" ? (
                                    <PlusIcon className="w-6 h-6 text-white" />
                                ) : (
                                    <LockIcon className="w-6 h-6 text-white" />
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {modalType === "add" ? "Tạo người dùng mới" : "Đặt lại mật khẩu"}
                            </h3>
                        </div>
                        <button
                            onClick={handleCloseModal}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Enhanced Modal Body */}
                    <form onSubmit={handleSave}>
                        <div className="p-8 space-y-8">
                            {modalType === "add" && (
                                <>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <UserIcon className="w-4 h-4" />
                                            Tên tài khoản
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="Nhập tên tài khoản"
                                            value={form.username}
                                            name="username"
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Vai trò
                                        </Label>
                                        <select
                                            name="role"
                                            className="w-full px-4 py-3.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            value={form.role}
                                            onChange={handleChange}
                                        >
                                            {Object.entries(information.role).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}



                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <LockIcon className="w-4 h-4" />
                                    {modalType === "add" ? "Mật khẩu" : "Mật khẩu mới"}
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={modalType === "add" ? "Nhập mật khẩu" : "Nhập mật khẩu mới"}
                                        value={form.password}
                                        name="password"
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeCloseIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 rounded-xl p-4 shadow-lg dark:from-red-900/20 dark:to-red-800/10 dark:border-red-800">
                                    <div className="flex items-center gap-3">
                                        <AlertIcon className="w-5 h-5 text-red-500" />
                                        <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Modal Footer */}
                        <div className="flex items-center justify-end gap-4 p-8 border-t border-gray-200/60 dark:border-gray-700 bg-gradient-to-r from-gray-50/30 to-transparent dark:from-gray-800/20">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={handleCloseModal}
                                className="px-6 py-3 text-sm font-semibold border-2 rounded-xl transition-all duration-200"
                            >
                                Hủy bỏ
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="px-8 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white border-2 border-white border-t-transparent rounded-full"></div>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    modalType === "add" ? "Tạo người dùng" : "Đặt lại mật khẩu"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200px 0;
                    }
                    100% {
                        background-position: calc(200px + 100%) 0;
                    }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200px 100%;
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </>
    );
}
