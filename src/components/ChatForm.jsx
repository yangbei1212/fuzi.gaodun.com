import React, { useRef } from 'react';
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
  onClearLastImage,
  onSubmit
}) => {
  const textAreaRef = useRef(null);

  // 简化的单词验证器（只做本地格式验证，不调用API）
  const wordValidator = (_, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error('请输入英文单词！'));
    }

    // 先检查格式
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return Promise.reject(new Error('只能输入英文字母！'));
    }

    // 去除空格，只验证单个单词
    const cleanWord = value.trim().replace(/\s+/g, '');
    
    if (cleanWord.length === 0) {
      return Promise.reject(new Error('请输入英文单词！'));
    }

    // 如果包含空格，提示只能输入单个单词
    if (value.trim().includes(' ')) {
      return Promise.reject(new Error('请输入单个英文单词（不要包含空格）'));
    }

    // 检查长度
    if (cleanWord.length > 45) {
      return Promise.reject(new Error('单词长度过长'));
    }

    return Promise.resolve();
  };

  return (
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
      onClearLastImage={onClearLastImage}
    />
    
    <div className="page-dialog-input-area">
      <Form.Item
        name="message"
        rules={[
          { validator: wordValidator }
        ]}
        validateTrigger={['onBlur', 'onSubmit']}
        style={{ margin: 0, width: '100%' }}
      >
        <Input.TextArea
          ref={textAreaRef}
          placeholder="请输入英文单词（如：apple, beautiful）..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="page-dialog-textarea"
          disabled={isLoading}
          autoFocus={false}
        />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        icon={<SendOutlined />}
        className="page-dialog-send-btn"
        loading={isLoading}
        disabled={isLoading || uploadingImages}
      >
        {isLoading ? 'AI思考中...' : '发送'}
      </Button>
    </div>
  </Form>
  );
};

export default ChatForm;
