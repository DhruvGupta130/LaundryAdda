import {Button, Modal, Card, message} from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import { PaperClipOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import {useState} from "react";
import {UPLOAD_PRICING} from "../../../../utils/config.js";
import axios from "axios";

const UploadModal = ({open, onClose, fetchLaundry}) => {
    const [fileList, setFileList] = useState([]);
    const [load, setLoad] = useState(false);

    const handleFileChange = (info) => {
        setFileList(info.fileList);
    };

    const handleDownloadSample = () => {
        const sampleUrl = '/sample_pricing_data.xlsx';

        const link = document.createElement('a');
        link.href = sampleUrl;
        link.download = 'prices_template.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async () => {
        setLoad(true);
        if (fileList.length === 0) {
            message.error('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileList[0]?.originFileObj);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(UPLOAD_PRICING, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            message.success(response.data?.message);
            await fetchLaundry();
            setFileList([]);
            onClose();
        } catch (error) {
            message.error(error?.response?.data?.message || 'An error occurred, please try again');
            console.error("Error in fetching doctors: ", error);
        } finally {
            setLoad(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center justify-between mb-4 mr-10">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Upload Prices File
                    </h3>
                    <Button
                        icon={<DownloadOutlined />}
                        type="default"
                        onClick={handleDownloadSample}
                        className="flex items-center gap-2"
                    >
                        Sample File
                    </Button>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            className="upload-modal"
            style={{ borderRadius: '8px' }}
        >
            <Card>
                <Dragger
                    name="file"
                    multiple={false}
                    fileList={fileList}
                    onChange={handleFileChange}
                    beforeUpload={() => false}
                    accept=".xlsx, .xls"
                    style={{
                        padding: '16px',
                        border: '1px dashed #d9d9d9',
                        borderRadius: '8px',
                        textAlign: 'center',
                    }}
                >
                    <p className="ant-upload-drag-icon">
                        <PaperClipOutlined style={{ fontSize: '32px' }} />
                    </p>
                    <p className="ant-upload-text">Drag or click to select Excel files (.xls, .xlsx)</p>
                    <p className="ant-upload-hint">Ensure the file matches the required format.</p>
                </Dragger>

                {/* Upload button */}
                <Button
                    icon={<UploadOutlined />}
                    type="primary"
                    onClick={handleSubmit}
                    className="upload-button"
                    disabled={fileList.length === 0 || load}
                    style={{ marginTop: '16px', width: '100%' }}
                    loading={load}
                >
                    {load ? 'Processing...' : 'Upload File'}
                </Button>
            </Card>
        </Modal>
    );
};

export default UploadModal;