import React from 'react';
import { Typography, Button, Input, Upload, List, Radio, Progress, Divider } from 'antd';
import {
    FileTextOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    SendOutlined,
    InboxOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// Project Description and File Upload Component
export const ProjectInputSection = ({
    isDarkMode,
    requirements,
    setRequirements,
    uploadedFiles,
    handleFileUpload,
    handleRemoveFile,
    getFileIcon,
    status,
    handleProcessRequirements,
    isProcessing
}) => (
    <div style={{ marginBottom: 40 }}>
        {/* Project Description Section */}
        <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{
                    color: isDarkMode ? '#fff' : '#1a1a1a',
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <FileTextOutlined style={{ color: isDarkMode ? '#60a5fa' : '#3b82f6' }} />
                    Project Description
                </Title>
                <Text style={{
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 14,
                    display: 'block',
                    marginTop: 4
                }}>
                    Describe your project requirements, goals, and any specific features you need.
                </Text>
            </div>

            <TextArea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Enter your project description here... (e.g., I need a web application for managing tasks with user authentication, CRUD operations, and real-time notifications)"
                rows={6}
                style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: 8,
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: 14
                }}
            />
        </div>

        {/* File Upload Section */}
        <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{
                    color: isDarkMode ? '#fff' : '#1a1a1a',
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <InboxOutlined style={{ color: isDarkMode ? '#60a5fa' : '#3b82f6' }} />
                    Supporting Documents
                </Title>
                <Text style={{
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 14,
                    display: 'block',
                    marginTop: 4
                }}>
                    Upload any relevant documents (TXT, PDF, DOC, DOCX) to provide additional context.
                </Text>
            </div>

            <Dragger
                multiple
                onChange={handleFileUpload}
                beforeUpload={() => false}
                showUploadList={false}
                style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                    border: `2px dashed ${isDarkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: 8,
                    marginBottom: uploadedFiles.length > 0 ? 16 : 0
                }}
            >
                <div style={{ padding: '24px 20px' }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{
                            color: isDarkMode ? '#6b7280' : '#9ca3af',
                            fontSize: 36
                        }} />
                    </p>
                    <p style={{
                        color: isDarkMode ? '#d1d5db' : '#374151',
                        fontSize: 14,
                        fontWeight: 500,
                        margin: '6px 0'
                    }}>
                        Click or drag files to upload
                    </p>
                    <p style={{
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                        fontSize: 12,
                        margin: 0
                    }}>
                        Support for TXT, PDF, DOC, and DOCX files. Maximum file size: 10MB
                    </p>
                </div>
            </Dragger>

            {uploadedFiles.length > 0 && (
                <div style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: 8,
                    padding: 12
                }}>
                    <Text style={{
                        color: isDarkMode ? '#f3f4f6' : '#374151',
                        fontWeight: 600,
                        fontSize: 14,
                        display: 'block',
                        marginBottom: 8
                    }}>
                        Uploaded Files ({uploadedFiles.length})
                    </Text>
                    <Divider style={{
                        margin: '12px 0',
                        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
                    }} />
                    <List
                        size="small"
                        dataSource={uploadedFiles}
                        renderItem={(file) => (
                            <List.Item
                                style={{
                                    padding: '8px 0',
                                    border: 'none'
                                }}
                                actions={[
                                    <Button
                                        key="delete"
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveFile(file.id)}
                                        style={{ color: isDarkMode ? '#ef4444' : '#dc2626' }}
                                        size="small"
                                    />
                                ]}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {getFileIcon(file.type)}
                                    <div>
                                        <div style={{
                                            color: isDarkMode ? '#e5e7eb' : '#374151',
                                            fontSize: 14,
                                            fontWeight: 500
                                        }}>
                                            {file.name}
                                        </div>
                                        <div style={{
                                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                                            fontSize: 12
                                        }}>
                                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Processing...'}
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </div>

        {/* Process Requirements Button */}
        {status === 'pending' && (
            <div style={{ marginBottom: 32 }}>
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleProcessRequirements}
                    loading={isProcessing}
                    size="large"
                    style={{
                        width: '100%',
                        height: 48,
                        fontSize: 16,
                        fontWeight: 600,
                        borderRadius: 8
                    }}
                    disabled={!requirements.trim() && uploadedFiles.length === 0}
                >
                    {isProcessing ? 'Processing Requirements...' : 'Process Requirements'}
                </Button>
            </div>
        )}
    </div>
);

// Questions Flow Component
export const QuestionsSection = ({
    isDarkMode,
    questions,
    currentQuestionIndex,
    answers,
    handleAnswerChange,
    handlePreviousQuestion,
    handleNextQuestion,
    progressPercent
}) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div style={{ marginBottom: 40 }}>
            {/* Progress Bar */}
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                }}>
                    <Text style={{
                        color: isDarkMode ? '#d1d5db' : '#374151',
                        fontWeight: 600
                    }}>
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </Text>
                    <Text style={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: 14
                    }}>
                        {Math.round(progressPercent)}% Complete
                    </Text>
                </div>
                <Progress
                    percent={progressPercent}
                    showInfo={false}
                    strokeColor={{
                        '0%': isDarkMode ? '#3b82f6' : '#2563eb',
                        '100%': isDarkMode ? '#10b981' : '#059669'
                    }}
                    trailColor={isDarkMode ? '#374151' : '#e5e7eb'}
                />
            </div>

            {/* Current Question */}
            <div style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: 12,
                padding: 24,
                marginBottom: 24
            }}>
                <Title level={3} style={{
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    fontSize: 20,
                    fontWeight: 600,
                    marginBottom: 16,
                    lineHeight: 1.3
                }}>
                    {currentQuestion?.question}
                    {currentQuestion?.required && (
                        <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
                    )}
                </Title>
                <Divider style={{
                    margin: '0 0 20px 0',
                    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
                }} />

                <Radio.Group
                    value={answers[currentQuestion?.id]}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    style={{ width: '100%' }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                    }}>
                        {currentQuestion?.options?.map((option, index) => (
                            <Radio
                                key={index}
                                value={option}
                                style={{
                                    color: isDarkMode ? '#e5e7eb' : '#374151',
                                    fontSize: 15,
                                    padding: '12px 16px',
                                    backgroundColor: answers[currentQuestion.id] === option
                                        ? (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)')
                                        : 'transparent',
                                    borderRadius: 8,
                                    border: `1px solid ${answers[currentQuestion.id] === option
                                        ? (isDarkMode ? '#3b82f6' : '#2563eb')
                                        : 'transparent'
                                    }`,
                                    margin: 0,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {option}
                            </Radio>
                        ))}
                    </div>
                </Radio.Group>
            </div>

            {/* Navigation Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    icon={<ArrowLeftOutlined />}
                    size="large"
                    style={{
                        borderColor: isDarkMode ? '#374151' : '#d1d5db',
                        color: isDarkMode ? '#d1d5db' : '#6b7280',
                        minWidth: 160
                    }}
                >
                    Previous
                </Button>

                <Button
                    type="primary"
                    onClick={handleNextQuestion}
                    icon={isLastQuestion ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
                    size="large"
                    style={{
                        backgroundColor: isLastQuestion ? '#10b981' : (isDarkMode ? '#3b82f6' : '#2563eb'),
                        borderColor: isLastQuestion ? '#10b981' : (isDarkMode ? '#3b82f6' : '#2563eb'),
                        minWidth: 160
                    }}
                >
                    {isLastQuestion ? 'Review Answers' : 'Next Question'}
                </Button>
            </div>
        </div>
    );
};

// Questions Summary Component
export const QuestionsSummarySection = ({
    isDarkMode,
    questions,
    answers,
    enhancedDescription,
    handleCompleteRequirements,
    isEnhancing,
    status,
    setShowQuestionsSummary,
    setCurrentQuestionIndex
}) => (
    <div style={{ marginBottom: 40 }}>
        <Title level={3} style={{
            color: isDarkMode ? '#f3f4f6' : '#1f2937',
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 16
        }}>
            Submit Answers
        </Title>

        <div style={{
            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20
        }}>
            {questions.map((question, index) => (
                <div key={question.id} style={{
                    marginBottom: index < questions.length - 1 ? 20 : 0,
                    paddingBottom: index < questions.length - 1 ? 20 : 0,
                    borderBottom: index < questions.length - 1
                        ? `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                        : 'none'
                }}>
                    <Text style={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: 14,
                        display: 'block',
                        marginBottom: 4
                    }}>
                        Question {index + 1}
                    </Text>
                    <Text style={{
                        color: isDarkMode ? '#d1d5db' : '#374151',
                        fontWeight: 600,
                        fontSize: 15,
                        display: 'block',
                        marginBottom: 8
                    }}>
                        {question.question}
                    </Text>
                    <div style={{
                        backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
                        padding: '8px 12px',
                        borderRadius: 6,
                        display: 'inline-block'
                    }}>
                        <Text style={{
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            fontSize: 14,
                            fontWeight: 500
                        }}>
                            {answers[question.id] || 'Not answered'}
                        </Text>
                    </div>
                </div>
            ))}
        </div>

        {!enhancedDescription && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start' }}>
                <Button
                    onClick={() => {
                        setShowQuestionsSummary(false);
                        setCurrentQuestionIndex(questions.length - 1);
                    }}
                    size="large"
                    style={{
                        borderColor: isDarkMode ? '#374151' : '#d1d5db',
                        color: isDarkMode ? '#d1d5db' : '#6b7280',
                        minWidth: 160
                    }}
                >
                    Back to Questions
                </Button>

                <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleCompleteRequirements}
                    loading={isEnhancing}
                    size="large"
                    style={{
                        backgroundColor: '#10b981',
                        borderColor: '#10b981',
                        minWidth: 160
                    }}
                >
                    {isEnhancing ? 'Enhancing...' : 'Submit Answers'}
                </Button>
            </div>
        )}
    </div>
);

// AI Enhanced Requirements Component
export const AIEnhancedSection = ({
    isDarkMode,
    enhancedDescription,
    onComplete
}) => (
    <div style={{ marginBottom: 40 }}>
        <Title level={3} style={{
            color: isDarkMode ? '#f3f4f6' : '#1f2937',
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
        }}>
            <CheckCircleOutlined style={{ color: '#10b981' }} />
            AI-Enhanced Requirements
        </Title>

        <TextArea
            value={enhancedDescription}
            readOnly
            rows={12}
            style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: 8,
                color: isDarkMode ? '#e5e7eb' : '#374151',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 24,
                resize: 'vertical'
            }}
            placeholder="Enhanced description will appear here after submitting answers..."
        />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={onComplete}
                size="large"
                style={{
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    minWidth: 160
                }}
            >
                Complete Analysis
            </Button>
        </div>
    </div>
);

// Completion State Component
export const CompletionSection = ({ isDarkMode }) => (
    <div style={{
        textAlign: 'center',
        padding: 40,
        backgroundColor: isDarkMode ? 'rgba(6, 95, 70, 0.1)' : '#d1fae5',
        borderRadius: 12,
        border: `1px solid ${isDarkMode ? '#10b981' : '#a7f3d0'}`
    }}>
        <CheckCircleOutlined style={{
            fontSize: 48,
            color: '#10b981',
            marginBottom: 16
        }} />
        <Title level={3} style={{
            color: isDarkMode ? '#d1fae5' : '#065f46',
            margin: '0 0 8px 0',
            fontSize: 24
        }}>
            Requirements Analysis Completed!
        </Title>
        <Text style={{
            color: isDarkMode ? '#a7f3d0' : '#047857',
            fontSize: 16
        }}>
            You can now proceed to the next step in the pipeline.
        </Text>
    </div>
);