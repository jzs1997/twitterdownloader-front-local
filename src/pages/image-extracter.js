import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/esm/Button';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import statusIdExtract from '../utils/tweetsUrlParser';
import { ExampleUrl, ImageIntro } from '../utils/Intros';
import { RotatingLines } from 'react-loader-spinner';
import { SupportedFormats } from '../utils/commons';

/**
 * TODO:
 * 1. Image stays when inpur form 
 */
export default function ImageExtracter(){

    const API_BASE = "http://localhost:8091/api/img/";

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
    const image = useRef(null);
    const imageName = useRef(null);

    /**
     *  This is real file object fetched
     */

    const fileObj = useRef(null);

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
                    console.log("Fetching: " + API_BASE + statusId);
                    setExtractedFile(null);
                    try{
                        const response = await fetch(API_BASE + "extract/" + statusId, myInit);
                        console.log("status code is:" + response.status);
                        
                        if(response.ok){
                            const img = await response.blob();
                            console.log("Extracted file is:" + img);
                            const imageUrl = URL.createObjectURL(img);
                            console.log("file name is:" + response.headers.get('Returned-Filename'));
                            const imgName = response.headers.get('Returned-Filename');
                            // setExtractedFile([imageUrl]);
                            fileObj.current = new File([img], imageName, {lastModified: new Date().getTime(), type: img.type, name: imageName});
                            setExtractedFile(imageUrl);
                            setExtractedFileName(imgName);
                        }else{
                            console.error("No resource found");
                        }
                    }catch(error){
                        console.error("Failed to fetch image:" + error);
                    }
                };
                
                // let ignore = false;
                fetchImage();
                // fetchTrigger[0] = false;
                return () => {
                    fetchTrigger[0] = false;
                }
            }, [statusId]);
            
            return [extractedFile, extractedFileName];
        }

        function ShowImage({statusId}){
            [image.current, imageName.current] = FetchImage({statusId});
            // savedExtractedFile.current = image.current;
            console.log("image url:" + image.current);
            console.log("image name:" + imageName.current);
            if(image !== null){
                return <Card.Img variant="top" src = {image.current} />;
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
            
            function handleDownload(imageUrl, fileName){
                // if(imageUrl === null || fileName === null) return;
                console.log("download url:" + imageUrl.current);
                console.log("download name:" + fileName.current);
                const link = document.createElement('a');
                link.href = imageUrl.current;
                link.download = fileName.current;
    
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            return (
                <Button variant='primary' onClick={() => handleDownload(image, imageName)}>Download</Button>
            )
        }

        return (
            <div>
                <Form onSubmit={handleFormSubmit}>
                    <Form.Label>Image Link</Form.Label>
                    <Form.Control type='text' placeholder={ExampleUrl} onChange={handleURLChange} value={resourceUrl} />
                    {fetchTrigger[0] && <ShowImage statusId={statusIdExtract(resourceUrl[0])} />}
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
                }

                function extract(){
                    console.log("current img url: " + image.current);
                    fileToConvert.current = fileObj.current;
                    fileToConvertName.current = imageName.current;
                    setSelectedFileName(imageName.current);
                    console.log("current file to convert is:" + fileToConvert.current);
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
    
            return (
                <Card.Body>
                    <Card.Title>Image Format Convert</Card.Title>
                    <UploadDropDownButton title_='From' id_= 'from' />
                    <FormatDropDownButton selectionArray={SupportedFormats}  title_='To' id_= 'to' />
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
                    
                    const formData = new FormData();
                    formData.append('file', fileToConvert.current, fileToConvertName.current);

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

                    console.log("Fetching: " + API_BASE + '/converted/' + fileToConvertName.current + '?' + new URLSearchParams({
                        destFormat: formatToConvert.current,
                    }));
                    
                    try{
                        const response = await fetch(API_BASE + 'converted/' + fileToConvertName.current + '?' + new URLSearchParams({
                            destFormat: formatToConvert.current,
                        }), {
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
    
            function ShowImage(){
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
                    <ShowImage />
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

    const introList = ImageIntro.map((e) => {
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