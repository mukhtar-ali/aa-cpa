import { ButtonHTMLAttributes, FC, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    icon?: ReactNode;
    loading?: boolean;
    variant?: 'primary' | 'outline';
}

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
    primary: 'btn-primary',
    outline: 'btn-outline',
};

export const CustomButton: FC<Props> = ({
    disabled,
    icon,
    loading,
    text,
    className,
    variant = 'primary',
    children,
    ...props
}) => {
    return (
        <button
            className={[
                'btn',
                variantClasses[variant],
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            disabled={disabled || loading}
            {...props}
        >
            {text ?? children}
            {icon}
        </button>
    );
};
