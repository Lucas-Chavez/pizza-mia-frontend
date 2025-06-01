import React from "react";
import Button from "../Button/Button";
import lupaIcon from "../../assets/icons/icon-lupa.svg";
import styles from "./SearchHeader.module.css";
import shared from "../../styles/common/Common.module.css";

interface SearchHeaderProps {
    onNewClick: () => void;
    title: string;
    search: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
    onNewClick,
    title,
    search,
    onSearchChange,
    placeholder = "Buscar"
}) => {
    return (
        <div className={styles.adminContentTop}>
            <Button
                label="Nuevo +"
                onClick={onNewClick}
                className={shared.nuevoButton}
            />
            <p className={styles.tituloCentrado}>{title}</p>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    className={styles.inputSearch}
                />
                <img src={lupaIcon} alt="Buscar" className={styles.lupaIcon} />
            </div>
        </div>
    );
};

export default SearchHeader;