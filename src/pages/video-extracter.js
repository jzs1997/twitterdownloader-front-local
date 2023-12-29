import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/esm/Button';
import { useEffect, useRef, useState } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import statusIdExtract from '../utils/tweetsUrlParser';
import {Player, ControlBar, BigPlayButton} from 'video-react';
import FormSelect from 'react-bootstrap/FormSelect';
import InputGroup from 'react-bootstrap/InputGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import parseDuration from '../utils/others';
import changeExt from '../utils/FileResolve';
import {ExampleUrl, VideoIntro} from '../utils/Intros';
import { RotatingLines } from 'react-loader-spinner';

/**
 * TODO:
 *  
 */
export default function ImageExtracter(){

    const API_BASE = "http://localhost:8091/api/video/";
    const formatRequest = {
        filename: null,
        width: null,
        height: null,
        flag: null,
        fps: null,
        duration: [0, 0],
    };

    const fpsList = ['fps', 5, 10, 15, 20, 25, 30, 'original(<=30)'];
    const sizeList = new Map([
        ['size', [0, 0, 0]],
        ['Original(up to 800px)', [800, -1, 1]],
        ['Original(up to 600px)', [600, -1, 1]],
        ['800 X 600', [800, 600, 2]],
        ['800 X 480', [800, 480, 2]],
        ['640 X 400', [800, 400, 2]],
        ['800 X AUTO', [800, -1, 2]],
        ['600 X AUTO', [600, -1, 2]],
        ['540 X AUTO', [540, -1, 2]],
        ['480 X AUTO', [480, -1, 2]],
        ['400 X AUTO', [400, -1, 2]],
        ['320 X AUTO', [320, -1, 2]],
    ])
    /**
     * Two sources: extracted from tweet or uploaded fron desktop
     * When going to 'convert', should be using this to do the convertion
     * Every time image being extracted or uploaded, this value should be updated
     */
    const fileToConvert = useRef(null);
    const fileToConvertName = useRef(null);
    const convertedFile = useRef(null);
    const convertedFileName = useRef(null);
    /**
     * Format the user want to convert the image to. 
     * Updated when dropdown button's option is selected
     */
    const formatToConvert = useRef(null);
    // const savedExtractedFile = useRef(null);
    /**
     * These two are Extracted Image and Image file name, get from fetch
     * Here the image is the uri of image, not a file ohject
     */

    /**
     *  This is real file object fetched
     */

    const fileObj = useRef(null);
    const fileObjName = useRef(null);

    const vUrl = useRef(null);
    const vName = useRef(null);

    function URLForm(){
        const [fetchTrigger, setFetchTrigger] = useState([false]);
        const [resourceUrl, setResourceUrl] = useState([null]);

        function FetchImage({statusId}){

            const [extractedFile, setExtractedFile] = useState(null);
            const [extractedFileName, setExtractedFileName] = useState(null);

            const myInit = {
                method: "get",
                mode: 'cors',
                credentials: 'include',
            };


            // Wrap useEffect in a custom hook, return the data you want. 
            useEffect(() => {
                const fetchImage = async () => {
                    console.log("Fetching: " + API_BASE + 'extract/' + statusId);
                    try{
                        const response = await fetch(API_BASE + 'extract/' + statusId, myInit);
                        console.log("status code is:" + response.status);
                        if(response.ok){
                            const img = await response.blob();
                            console.log("Extracted file is:" + img);
                            const imgName = response.headers.get('Returned-Filename');
                            fileObj.current = new File([img], imgName, {lastModified: new Date().getTime(), type: img.type, name: imgName});
                            fileObjName.current = imgName;
                            setExtractedFile(URL.createObjectURL(img));
                            setExtractedFileName(imgName);
                        }else{
                            console.error("No resource found");
                        }
                    }catch(error){
                        console.error("Failed to fetch image:" + error);
                    }
                };
                
                fetchImage();
                return () => {
                    fetchTrigger[0] = false;
                }
            }, [statusId]);
            return [extractedFile, extractedFileName]
        }

        /**
         * Need to be modified
         * @param {} param0 
         * @returns 
         */

        function ShowVideo({statusId}){
            [vUrl.current, vName.current] = FetchImage({statusId});
            if(vUrl !== null){
                return (
                    <Player src={vUrl.current} >
                        <ControlBar autoHide={false} className = "contorl-bar" />
                        <BigPlayButton position="center" />
                    </Player>
                );
            }else{
                return ;
            }
        }

        const handleFormSubmit = (e) => {
            e.preventDefault();
            console.log("triggered");
            setFetchTrigger([true]);
        }

        function handleURLChange(e){
            resourceUrl[0] = e.target.value;
        }

        function DownloadButton(){
            
            function handleDownload(){
                // if(imageUrl === null || fileName === null) return;
                const link = document.createElement('a');
                link.href = URL.createObjectURL(fileObj.current);
                link.download = fileObjName.current;
    
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            return (
                <Button variant='primary' onClick={() => handleDownload()}>Download</Button>
            )
        }

        return (
            <div>
                <Form onSubmit={handleFormSubmit}>
                    <Form.Label>Tweet URL</Form.Label>
                    <Form.Control type='text' placeholder={ExampleUrl} onChange={handleURLChange} value={resourceUrl} />
                    {fetchTrigger[0] && <ShowVideo statusId={statusIdExtract(resourceUrl[0])} />}
                    {resourceUrl[0] && <Form.Text>{resourceUrl[0]}</Form.Text>}
                    <Button variant='primary'type='submit' >Extract</Button>
                    <DownloadButton />
                </Form>
            </div>
        )
    }


    function ConvertCard(){
        function DropDownButtons(){

            const [selectedFileName, setSelectedFileName] = useState(null);

            function UploadDropDownButton({title_, id_ }){
                
                const inputFile = useRef(null);
        
                function handleClick(){
                    inputFile.current.click();
                }
        
                function handleChange(event){
                    const fileUploaded = event.target.files[0];
                    console.log("uploaded file is:" + fileUploaded);
                    setSelectedFileName(fileUploaded.name);
                    fileToConvert.current = fileUploaded;
                    fileToConvertName.current = fileUploaded.name;
                    formatRequest.filename = fileUploaded.name;
                }

                function extract(){
                    console.log("current img url: " + URL.createObjectURL(fileObj.current));
                    fileToConvert.current = fileObj.current;
                    fileToConvertName.current = fileObjName.current;
                    setSelectedFileName(fileObjName.current);
                    console.log("current file to convert is:" + fileToConvert.current);
                    formatRequest.filename = fileObjName.current;
                }
        
        
                return (
                    <div>
                        <DropdownButton id={id_} title={title_}>
                        <Dropdown.Item onClick={extract}>Downloaded Resource</Dropdown.Item>
                        <Dropdown.Item onClick={handleClick}>
                            Your PC
                        </Dropdown.Item>
                        <input type='file' id='file' onChange={handleChange} ref={inputFile} style={{display: 'none'}}/>
                    </DropdownButton>
        
                    {selectedFileName && (
                    <div>
                        <p>selected file: {selectedFileName}</p>
                    </div>
                        )}
                    </div>
                )
            }
        
            function FormatDropDownButton({ selectionArray, title_, id_ }){
        
                const [outputFormat, setOutputFormat] = useState('');
        
                function handleFormatChange(format){
                    setOutputFormat(format);
                    formatToConvert.current = format;
                }
        
                const listItems = selectionArray.map((e) => {
                    return (
                        <Dropdown.Item onClick={() => handleFormatChange(e)}>{e}</Dropdown.Item>
                    )
                })
        
                return (
                    <div>
                        <DropdownButton id={id_} title={title_}>
                        {listItems}
                        </DropdownButton>
                        {outputFormat && (
                        <div>
                            <p>{outputFormat}</p>
                        </div>
                        )}
                    </div>
                )
            }
            
            function makeArrayFromMapKeys(map){
                const arr = [];
                function callbackFn(value, key, map){
                    arr.push(key);
                }
                map.forEach(callbackFn);
                return arr;
            }

            function FpsFormSelect({selectionArray, title_, id_}){
                function handleFpsChange(e){
                    let fps = e.target.value;
                    if(fps === 'original(<=30)') fps = -1;
                    formatRequest.fps = fps;
                }
                const listItems = selectionArray.map((e) => {
                    return (
                        <option value={e}>{e}</option>
                    )
                })
                return (
                    <div>
                        <Form.Label>FPS</Form.Label>
                        <FormSelect id={id_} title={title_} size='sm' onChange={handleFpsChange}>
                            {listItems}
                        </FormSelect>
                    </div>
                )
            }
            
            function SizeFormSelect({selectionArray, title_, id_}){
                const [width, setWidth] = useState(null);
                const [height, setHeight] = useState(null);
                const [flag, setFlag] = useState(null);

                function handleSizeChange(e){
                    const value = sizeList.get(e.target.value);
                    formatRequest.width = value[0];
                    formatRequest.height = value[1];
                    formatRequest.flag = value[2];
                    setWidth(value[0]);
                    setHeight(value[1]);
                    setFlag(value[2]);
                }
                const listItems = selectionArray.map((e) => {
                    return (
                        <option value={e}>{e}</option>
                    )
                })
                return (
                    <div>
                        <Form.Label>Size</Form.Label>
                        <FormSelect id={id_} title={title_} size='sm' onChange={handleSizeChange}>
                            {listItems}
                        </FormSelect>
                        {width && height &&
                        <div>
                        <Form.Text>Width: {formatRequest.width}</Form.Text>
                        <Form.Text>Height: {formatRequest.height}</Form.Text>
                        <Form.Text>Flag: {formatRequest.flag}</Form.Text>
                        </div>
                        }
                    </div>
                )
            }

            function TimeInput1({label}){
                const [sec, setSec] = useState(0);
                
                function handleChange(e){
                    const inputValue = e.target.value;
                    const newSec = isNaN(inputValue) ? 0 : parseInt(inputValue, 10);
                    setSec(newSec);
                    formatRequest.duration[0] = newSec;
                }

                function handleClickPlus(){
                    if(sec === 9999) return ;
                    const newSec = sec + 1;
                    setSec(newSec);
                    formatRequest.duration[0] = newSec;
                }

                function handleClickMinus(){
                    if(sec === 0) return ;
                    const newSec = sec - 1;
                    setSec(newSec);
                    formatRequest.duration[0] = newSec;
                }

                return (
                    <div>
                        <FormGroup controlId='timeInput'>
                            <Form.Label>{label}</Form.Label>
                            <InputGroup className="mb-3" size='sm'>
                                <Form.Control type='number' aria-label="Example text with two button addons" size='sm' onChange={handleChange} value={sec}/>
                                <ButtonGroup size='sm'>
                                    <Button variant="outline-secondary" onClick={handleClickMinus}>🠋</Button>
                                    <Button variant="outline-secondary" onClick={handleClickPlus}>🠉</Button>
                                </ButtonGroup>
                            </InputGroup>
                        </FormGroup>
                    </div>
                )
            }

            function TimeInput2({label}){
                const [sec, setSec] = useState(0);
                
                function handleChange(e){
                    const inputValue = e.target.value;
                    const newSec = isNaN(inputValue) ? 0 : parseInt(inputValue, 10);
                    setSec(newSec);
                    formatRequest.duration[1] = newSec;
                }

                function handleClickPlus(){
                    if(sec === 9999) return ;
                    const newSec = sec + 1;
                    setSec(newSec);
                    formatRequest.duration[1] = newSec;
                }

                function handleClickMinus(){
                    if(sec === 0) return ;
                    const newSec = sec - 1;
                    setSec(newSec);
                    formatRequest.duration[1] = newSec;
                }

                return (
                    <div>
                        <FormGroup controlId='timeInput'>
                            <Form.Label>{label}</Form.Label>
                            <InputGroup className="mb-3" size='sm'>
                                <Form.Control type='number' aria-label="Example text with two button addons" size='sm' onChange={handleChange} value={sec}/>
                                <ButtonGroup size='sm'>
                                    <Button variant="outline-secondary" onClick={handleClickMinus}>🠋</Button>
                                    <Button variant="outline-secondary" onClick={handleClickPlus}>🠉</Button>
                                </ButtonGroup>
                            </InputGroup>
                        </FormGroup>
                    </div>
                )
            }

            return (
                <Card.Body>
                    <Card.Title>Convert Video to GIF</Card.Title>
                    <UploadDropDownButton title_='from' id_= 'from' />
                    <FormatDropDownButton selectionArray={['GIF']}  title_='to' id_= 'to' />
                    <FpsFormSelect selectionArray={fpsList} title_='fps' id_='fps' />
                    <SizeFormSelect selectionArray={makeArrayFromMapKeys(sizeList)} title_='size' id_='size' />
                    <TimeInput1 label='Start Time'/>
                    <TimeInput2 label='End Time' />
                </Card.Body>
            )
        }

        function ConvertButtons(){
            
            const [shownFile, setShownFile] = useState(null);
            const [shownFileName, setShownFileName] = useState(null);
            const [onProcessing, setOnProcessing] = useState(false);

            function DownloadButton(){
            
                function handleDownload(){
                    if(shownFile === null) return;
                    console.log("converted file url:" + URL.createObjectURL(shownFile));
                    console.log("converted file name:" + shownFileName);
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(shownFile);
                    link.download = shownFileName;
        
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
    
                return (
                    <Button variant='primary' onClick={() => handleDownload()}>Download</Button>
                )
            }

            function ConvertButton(){

                async function handleClick(e){
                    e.preventDefault();

                    const newFormatRequest = structuredClone(formatRequest);
                    newFormatRequest.duration = parseDuration(formatRequest.duration);
                    
                    
                    const formData = new FormData();
                    formData.append('file', fileToConvert.current, fileToConvertName.current);
                    formData.append('params', new Blob([JSON.stringify(newFormatRequest)], {type: 'application/json'}));

                    setOnProcessing(true);

                    try{
                        const response = await fetch(API_BASE + 'convert', {
                            method: 'post',
                            body: formData,
                            mode:'cors',
                            credentials: 'include',
                        });

                        if(response.ok){
                            console.log("Uploaded");
                        }else{
                            console.error("Upload failed");
                        }
                    }catch(error){
                        console.error("Error on uploading: ", error);
                    }

                    console.log("Fetching: " + API_BASE + '/converted/' + changeExt(fileToConvertName.current, 'gif'));

                    try{
                        const response = await fetch(API_BASE + 'converted/' + changeExt(fileToConvertName.current, 'gif'), {
                            method: "get",
                            mode: 'cors',
                            credentials: 'include',
                        });
                        console.log("status code is:" + response.status);
                        
                        if(response.ok){
                            const convertedImage = await response.blob();
                            setShownFile(convertedImage);
                            setShownFileName(response.headers.get('Returned-Filename'));
                        }else{
                            console.error("No resource found");
                        }
                    }catch(error){
                        console.error("Failed to fetch image:" + error);
                    }
                    setOnProcessing(false);
                }
                return (
                    <Button variant='primary' onClick={handleClick}>Convert</Button>
                )
            }
            
            function ShowVideo(){
                if(onProcessing === true){
                    return <RotatingLines
                    strokeColor="grey"
                    strokeWidth="5"
                    animationDuration="0.75"
                    width="96"
                    visible={true}
                  />
                }else{
                    return <Card.Img variant='top' src={shownFile === null ? null :URL.createObjectURL(shownFile)} height={300} width={300} />
                }
            }

            return (
                <Card>
                    <ShowVideo />
                    <Card.Body>
                        <ConvertButton />
                        <DownloadButton />
                    </Card.Body>
                </Card>
            )
        }

        return (
            <CardGroup>
                <Card className='Card' style={{width: 'auto', background: 'grey'}}>
                    <DropDownButtons />
                </Card>
                <ConvertButtons />
            </CardGroup>
        )
    }

    const introList = VideoIntro.map((e) => {
        return <ListGroup.Item>{e}</ListGroup.Item>
    });

    return (
        <>
        {/* Upper part */}
        <CardGroup className='CardGroup'>
            <Card className='Card' style={{width: 'auto', background: 'grey'}}>
                <Card.Header>Usage</Card.Header>
                <Card.Body>
                    <ListGroup>
                        {introList}    
                    </ListGroup>
                </Card.Body>
            </Card>

            <Card style={{width: 'auto', background: 'grey'}}>
                <Card.Body>
                    <URLForm />
                </Card.Body>
            </Card>
        </CardGroup>

        {/* bottom part */}
        <ConvertCard />
        </>
    )
}