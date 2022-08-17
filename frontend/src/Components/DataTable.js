import React from 'react';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from 'styled-components';

const Table = (props) => {
    const themeContext = React.useContext(ThemeContext);

    createTheme('tdf', {
        text: {
            primary: themeContext.colors.primary,
            secondary: themeContext.colors.secondary
        },
        background: {
            default: themeContext.colors.background,
        }
    }, 'dark')

   return <DataTable {...props} theme={'tdf'} />
}

export default Table;