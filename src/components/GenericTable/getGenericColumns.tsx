import chevronUp from "../../assets/icons/circle-chevron-up.svg";
import chevronDown from "../../assets/icons/circle-chevron-down.svg";
import iconEdit from "../../assets/icons/icon-edit.svg";
import styles from "./getGenericColumns.module.css"; // Ajusta la ruta si es necesario

export const getGenericColumns = ({
    onAlta,
    onBaja,
    onEditar,
    estadoKey = "estado",
    disabledAlta = () => false,
    disabledBaja = () => false,
}: {
    onAlta: (row: any, rowIndex: number) => void;
    onBaja: (row: any, rowIndex: number) => void;
    onEditar: (row: any, rowIndex: number) => void;
    estadoKey?: string;
    disabledAlta?: (row: any) => boolean;
    disabledBaja?: (row: any) => boolean;
}) => [
    {
        header: "Estado",
        key: estadoKey,
        render: (value: string) => (
            <span
                style={{
                    color: value === "Activo" ? "#5ACD40" : "#D64C4C",
                    fontWeight: 600,
                }}
            >
                {value}
            </span>
        ),
    },
    {
        header: "Cambiar Estado",
        key: "cambiarEstado",
        render: (_: any, row: any, rowIndex: number) => {
            const isActive = row[estadoKey] === "Activo";
            const disabled = isActive ? disabledBaja(row) : disabledAlta(row);
            
            return (
                <button
                    className={styles.actionButton}
                    onClick={() => isActive ? onBaja(row, rowIndex) : onAlta(row, rowIndex)}
                    disabled={disabled}
                    type="button"
                >
                    <img
                        src={isActive ? chevronDown : chevronUp}
                        alt={isActive ? "Dar de Baja" : "Dar de Alta"}
                        className={styles.actionIcon}
                        style={{ opacity: disabled ? 0.4 : 1 }}
                    />
                </button>
            );
        },
    },
    {
        header: "Editar",
        key: "editar",
        render: (_: any, row: any, rowIndex: number) => (
            <button
                className={styles.actionButton}
                onClick={() => onEditar(row, rowIndex)}
                type="button"
            >
                <img
                    src={iconEdit}
                    alt="Editar"
                    className={styles.actionIcon}
                />
            </button>
        ),
    },
];