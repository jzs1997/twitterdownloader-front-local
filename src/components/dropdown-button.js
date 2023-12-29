import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { useRef, useState } from 'react';

/**
 * 
 * @param {*} param0 
 * @returns  
 */

export default function CustomizedDropDownButton({ selectionArray, title_, id_ }){
    const listItems = selectionArray.map((e) => {
        return (
            <Dropdown.Item>{e}</Dropdown.Item>
        )
    });
    return (
        <DropdownButton id={id_} title={title_}>
        {listItems}
        </DropdownButton>
    )
}

/**
 * 
 * @param {*} param0 
 * @returns 
 */

export function UploadDropDownButton({title_, id_ }){
    
    const inputFile = useRef(null);

    function handleClick(){
        inputFile.current.click();
    }
    return (
        <DropdownButton id={id_} title={title_}>
            <Dropdown.Item>Downloaded Resource</Dropdown.Item>
            <Dropdown.Item onClick={handleClick}>
                Your PC
            </Dropdown.Item>
            <input type='file' id='file' ref={inputFile} style={{display: 'none'}}/>
        </DropdownButton>
    )
}
