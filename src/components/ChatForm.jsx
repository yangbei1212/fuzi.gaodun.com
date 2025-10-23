import React from 'react';
import { Form, Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import ImageUpload from './ImageUpload';

const ChatForm = ({ 
  form,
  fileList,
  uploadingImages,
  lastUploadedImage,
  isLoading,
  onUploadChange,
  beforeUpload,
  onSubmit
}) => (
  <Form
    form={form}
    onFinish={onSubmit}
    className="page-dialog-form"
  >
    <ImageUpload
      fileList={fileList}
      uploadingImages={uploadingImages}
      lastUploadedImage={lastUploadedImage}
      onUploadChange={onUploadChange}
      beforeUpload={beforeUpload}
    />
    
    <div className="page-dialog-input-area">
      <Form.Item
        name="message"
        rules={[
          { required: true, message: '请输入英文单词！' },
          { 
            pattern: /^[a-zA-Z\s]+$/, 
            message: '只能输入英文字母和空格！' 
          }
        ]}
        style={{ margin: 0, width: '100%' }}
      >
        <Input.TextArea
          placeholder="请输入英文单词（如：apple, beautiful）..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          className="page-dialog-textarea"
        />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        icon={<SendOutlined />}
        className="page-dialog-send-btn"
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'AI思考中...' : '发送'}
      </Button>
    </div>
  </Form>
);

export default ChatForm;
