import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../Components/Form";

export function ThemeSelect({ theme, setTheme }) {
  const [ useDark, setUseDark ] = useState(true);

  useEffect(() => {
    setTheme(useDark ? 'Dark' : 'Light');
  }, [useDark])
  
  return (
    <>
      <Button onClick={(evt) => setUseDark(!useDark)}>
        <FontAwesomeIcon fixedWidth icon={faPalette} />
      </Button>
    </>
  );
}
