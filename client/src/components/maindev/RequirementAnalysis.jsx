import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { message } from 'antd';
import {
    FileTextOutlined,
    FilePdfOutlined,
    FileWordOutlined,
} from '@ant-design/icons';
import { requirementServices } from '../../api/apiEndpoints';
import {
    ProjectInputSection,
    QuestionsSection,
    QuestionsSummarySection,
    AIEnhancedSection,
    CompletionSection
} from './RequirementComponents';

const RequirementAnalysis = ({ isActive, onComplete, onNext, onPrevious }) => {
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const isDarkMode = theme === 'dark';

    // State management
    const [requirements, setRequirements] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [status, setStatus] = useState('pending');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showQuestionsSummary, setShowQuestionsSummary] = useState(false);
    const [combinedText, setCombinedText] = useState('');
    const [requirementId, setRequirementId] = useState(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhancedDescription, setEnhancedDescription] = useState('');

    // Utility functions
    const getFileIcon = (fileType) => {
        if (fileType && fileType.includes('pdf')) return <FilePdfOutlined style={{ color: '#ef4444' }} />;
        if (fileType && (fileType.includes('word') || fileType.includes('document'))) return <FileWordOutlined style={{ color: '#2563eb' }} />;
        return <FileTextOutlined style={{ color: '#10b981' }} />;
    };

    const handleFileUpload = (info) => {
        const { fileList } = info;

        const validFiles = fileList.filter(file => {
            const allowedTypes = [
                'text/plain',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!allowedTypes.includes(file.type)) {
                message.error(`${file.name}: Only TXT, PDF, DOC, and DOCX files are allowed`);
                return false;
            }
            return true;
        });

        setUploadedFiles(validFiles.map(f => ({
            id: f.uid,
            name: f.name,
            type: f.type,
            size: f.size,
            status: f.status || 'done',
            originFileObj: f.originFileObj
        })));

        return false;
    };

    const handleRemoveFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        message.success('File removed successfully');
    };

    const handleProcessRequirements = async () => {
        if (!user) {
            message.error('Please log in to process requirements');
            return;
        }

        if (!requirements.trim() && uploadedFiles.length === 0) {
            message.error('Please provide project description or upload supporting documents');
            return;
        }

        setIsProcessing(true);
        setStatus('running');

        try {
            const formData = new FormData();
            formData.append('description', requirements);

            uploadedFiles.forEach(fileInfo => {
                if (fileInfo.originFileObj) {
                    formData.append('files', fileInfo.originFileObj);
                }
            });

            let token = user?.token;
            if (!token) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    token = parsedUser?.token;
                }
            }

            if (!token) {
                token = localStorage.getItem('token');
            }

            if (!token) {
                message.error('Authentication token not found. Please log in again.');
                setStatus('pending');
                setIsProcessing(false);
                return;
            }

            const response = await requirementServices.processRequirements(formData, token);

            if (response.success) {
                setQuestions(response.questions);
                setCurrentQuestionIndex(0);
                setCombinedText(requirements);
                setRequirementId(response.data?.requirementId);
                message.success('Requirements processed successfully! Please answer the questions below.');
            } else {
                throw new Error(response.error || 'Failed to process requirements');
            }
        } catch (error) {
            console.error('Error processing requirements:', error);
            message.error(error.message || 'Failed to process requirements');
            setStatus('pending');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAnswerChange = (value) => {
        const currentQuestion = questions[currentQuestionIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
        }));
    };

    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];

        if (currentQuestion.required && !answers[currentQuestion.id]) {
            message.error('Please answer this required question before proceeding');
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowQuestionsSummary(true);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleCompleteRequirements = async () => {
        const requiredQuestions = questions.filter(q => q.required);
        const answeredRequired = requiredQuestions.filter(q => answers[q.id]);

        if (answeredRequired.length < requiredQuestions.length) {
            message.error('Please answer all required questions before proceeding');
            return;
        }

        setIsEnhancing(true);

        try {
            let token = user?.token;
            if (!token) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    token = parsedUser?.token;
                }
            }

            if (!token) {
                token = localStorage.getItem('token');
            }

            if (!token) {
                message.error('Authentication token not found. Please log in again.');
                setIsEnhancing(false);
                return;
            }

            const formattedAnswers = questions.map(question => ({
                question: question.question,
                answer: answers[question.id] || 'Not answered'
            }));

            const enhanceData = {
                description: combinedText,
                answers: formattedAnswers,
                requirementId: requirementId
            };

            const response = await requirementServices.enhanceRequirements(enhanceData, token);

            if (response.success) {
                setEnhancedDescription(response.data.improvedDescription);
                message.success('Requirements enhanced successfully with AI!');
            } else {
                throw new Error(response.error || 'Failed to enhance requirements');
            }
        } catch (error) {
            console.error('Error enhancing requirements:', error);
            message.error(error.message || 'Failed to enhance requirements');
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleCompleteAnalysis = () => {
        setStatus('completed');
        // Pass enhanced description to parent for next agent
        onComplete({ enhancedDescription });
    };

    // Calculate progress
    const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <div style={{
            maxWidth: '100%',
            margin: '0 auto',
            padding: '0 8px'
        }}>
            {/* Project Input Section - Component 1 */}
            <ProjectInputSection
                isDarkMode={isDarkMode}
                requirements={requirements}
                setRequirements={setRequirements}
                uploadedFiles={uploadedFiles}
                handleFileUpload={handleFileUpload}
                handleRemoveFile={handleRemoveFile}
                getFileIcon={getFileIcon}
                status={status}
                handleProcessRequirements={handleProcessRequirements}
                isProcessing={isProcessing}
            />

            {/* Questions Section - Component 2 */}
            {questions.length > 0 && !showQuestionsSummary && (
                <QuestionsSection
                    isDarkMode={isDarkMode}
                    questions={questions}
                    currentQuestionIndex={currentQuestionIndex}
                    answers={answers}
                    handleAnswerChange={handleAnswerChange}
                    handlePreviousQuestion={handlePreviousQuestion}
                    handleNextQuestion={handleNextQuestion}
                    progressPercent={progressPercent}
                />
            )}

            {/* Questions Summary Section */}
            {showQuestionsSummary && !enhancedDescription && (
                <QuestionsSummarySection
                    isDarkMode={isDarkMode}
                    questions={questions}
                    answers={answers}
                    enhancedDescription={enhancedDescription}
                    handleCompleteRequirements={handleCompleteRequirements}
                    isEnhancing={isEnhancing}
                    status={status}
                    setShowQuestionsSummary={setShowQuestionsSummary}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                />
            )}

            {/* AI Enhanced Section - Component 3 */}
            {showQuestionsSummary && enhancedDescription && (
                <>
                    <QuestionsSummarySection
                        isDarkMode={isDarkMode}
                        questions={questions}
                        answers={answers}
                        enhancedDescription={true}
                        handleCompleteRequirements={handleCompleteRequirements}
                        isEnhancing={isEnhancing}
                        status={status}
                        setShowQuestionsSummary={setShowQuestionsSummary}
                        setCurrentQuestionIndex={setCurrentQuestionIndex}
                    />

                    <AIEnhancedSection
                        isDarkMode={isDarkMode}
                        enhancedDescription={enhancedDescription}
                        onComplete={handleCompleteAnalysis}
                    />
                </>
            )}

            {/* Completion Section */}
            {status === 'completed' && (
                <CompletionSection isDarkMode={isDarkMode} />
            )}
        </div>
    );
};

export default RequirementAnalysis;