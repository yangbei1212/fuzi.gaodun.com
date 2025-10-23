import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import ImageUpload from './ImageUpload';
import { validateEnglishWord } from '../services/dictionary';

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
  const [validating, setValidating] = useState(false);

  // 自定义单词验证器
  const wordValidator = async (_, value) => {
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

    // 调用API验证单词
    setValidating(true);
    try {
      const result = await validateEnglishWord(cleanWord);
      setValidating(false);
      
      if (!result.valid) {
        return Promise.reject(new Error(result.message));
      }
      
      return Promise.resolve();
    } catch (error) {
      setValidating(false);
      // 如果验证失败，也允许通过（降级处理）
      return Promise.resolve();
    }
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
        validateTrigger="onBlur"
        style={{ margin: 0, width: '100%' }}
      >
        <Input.TextArea
          placeholder="请输入英文单词（如：apple, beautiful）..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          className="page-dialog-textarea"
          disabled={validating}
        />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        icon={<SendOutlined />}
        className="page-dialog-send-btn"
        loading={isLoading || validating}
        disabled={isLoading || validating}
      >
        {validating ? '验证单词中...' : isLoading ? 'AI思考中...' : '发送'}
      </Button>
    </div>
  </Form>
  );
};

export default ChatForm;
