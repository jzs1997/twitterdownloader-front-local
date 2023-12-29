import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ImageExtracter from '../pages/image-extracter';
import VideoExtracter from '../pages/video-extracter';

export default function ContentTab() {
  return (
    <Tabs
      defaultActiveKey="Image"
      id="uncontrolled-tab-example"
      className="mb-3"
    >
      <Tab eventKey="Image" title="Tweet Image Extraction & Image Conversion">
        <ImageExtracter />
      </Tab>
      <Tab eventKey="Video" title="Tweet Video Extraction & Video to GIF">
        <VideoExtracter />
      </Tab>
      <Tab eventKey="Info" title="Info">
        Tab content for Contact
      </Tab>
    </Tabs>
  );
}