import { useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { Modal, message } from 'antd';
import { sdGenServices, workflowServices } from '../api/apiEndpoints';
import {
    FileTextOutlined,
    ProjectOutlined,
    SketchOutlined,
    CodeOutlined,
    BugOutlined,
    RocketOutlined
} from '@ant-design/icons';

// Component imports
import MainDevHeader from '../components/maindev/MainDevHeader';
import ProgressStepper from '../components/maindev/ProgressStepper';
import TeamAgentView from '../components/maindev/TeamAgentView';
import EmptyState from '../components/maindev/EmptyState';
import AgentCanvasDesigner from '../components/maindev/AgentCanvasDesigner';
import AgentPipelineView from '../components/maindev/AgentPipelineView';
import AIChatSidebar from '../components/maindev/AIChatSidebar';

// Agent component imports
import RequirementAnalysis from '../components/maindev/RequirementAnalysis';
import PlanningAgent from '../components/maindev/AgentTemplates/PlanningAgent';
import DesignAgent from '../components/maindev/AgentTemplates/DesignAgent';
import DevelopmentAgent from '../components/maindev/AgentTemplates/DevelopmentAgent';
import TestingAgent from '../components/maindev/AgentTemplates/TestingAgent';
import CICDAgent from '../components/maindev/AgentTemplates/CICDAgent';

const MainDev = () => {
    const { theme } = useContext(ThemeContext);
    const location = useLocation();
    const isDarkMode = theme === 'dark';

    // Core state
    const [viewMode, setViewMode] = useState('team'); // 'team', 'canvas', 'pipeline'
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    // Team-based agent execution state
    const [agents, setAgents] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [agentData, setAgentData] = useState({
        enhancedDescription: null,
        planningData: null
    });

    // Custom agent pipeline state
    const [customAgentData, setCustomAgentData] = useState(null);
    const [workflowLoaded, setWorkflowLoaded] = useState(false);

    // AI Chat sidebar state
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Component mapping helpers
    const getAgentComponent = (agentName) => {
        const lowerName = agentName.toLowerCase();
        if (lowerName.includes('requirement')) return RequirementAnalysis;
        if (lowerName.includes('planning')) return PlanningAgent;
        if (lowerName.includes('design')) return DesignAgent;
        if (lowerName.includes('development')) return DevelopmentAgent;
        if (lowerName.includes('testing')) return TestingAgent;
        if (lowerName.includes('ci/cd') || lowerName.includes('cicd')) return CICDAgent;
        return RequirementAnalysis;
    };

    const getAgentIcon = (iconName) => {
        const iconMap = {
            'FileTextOutlined': FileTextOutlined,
            'ProjectOutlined': ProjectOutlined,
            'SketchOutlined': SketchOutlined,
            'CodeOutlined': CodeOutlined,
            'BugOutlined': BugOutlined,
            'RocketOutlined': RocketOutlined,
        };
        return iconMap[iconName] || FileTextOutlined;
    };

    // API handlers
    useEffect(() => {
        fetchTeams();
    }, []);

    // Load workflow if passed from MyWorkflows page
    useEffect(() => {
        if (location.state?.workflow && teams.length > 0 && !workflowLoaded) {
            const workflow = location.state.workflow;
            try {
                // Parse workflow data from database
                const workflowData = typeof workflow.workflowData === 'string'
                    ? JSON.parse(workflow.workflowData)
                    : workflow.workflowData;

                console.log('Loading workflow:', workflow.name);
                console.log('Workflow data:', workflowData);

                // Extract teamId and set selectedTeam FIRST
                if (workflowData.teamId) {
                    const team = teams.find(t => t.id === workflowData.teamId);
                    if (team) {
                        setSelectedTeam(team);
                        console.log('Selected team:', team.name);
                    } else {
                        console.warn('Team not found for ID:', workflowData.teamId);
                    }
                } else {
                    console.warn('No teamId in workflow data');
                }

                // Set workflow data to populate canvas
                setCustomAgentData(workflowData);
                setViewMode('canvas');
                setWorkflowLoaded(true);
                message.success(`Loaded workflow: ${workflow.name}`);
            } catch (error) {
                console.error('Error loading workflow:', error);
                message.error('Failed to load workflow');
            }
        }
    }, [location.state, teams, workflowLoaded]);


    const fetchTeams = async () => {
        setTeamsLoading(true);
        try {
            const data = await sdGenServices.getTeams();
            if (data.success) {
                setTeams(data.teams);
            } else {
                message.error('Failed to load teams');
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            message.error('Failed to load teams');
        } finally {
            setTeamsLoading(false);
        }
    };

    const fetchAgents = async (teamId) => {
        setLoading(true);
        try {
            const data = await sdGenServices.getAgentsByTeam(teamId);

            if (data.success) {
                const processedAgents = data.agents.map((agent, index) => ({
                    key: agent.name.toLowerCase().replace(/\s+/g, '_'),
                    title: agent.name,
                    component: getAgentComponent(agent.name),
                    description: agent.description,
                    icon: getAgentIcon(agent.icon),
                    order: agent.order || index
                }));
                setAgents(processedAgents);

                // Convert team agents to canvas format for potential canvas use
                const canvasAgents = data.agents.map((agent, index) => ({
                    id: `agent-${agent.name.toLowerCase().replace(/\s+/g, '-')}`,
                    name: agent.name,
                    description: agent.description,
                    prompt: agent.prompt || `You are a ${agent.name.toLowerCase()}. ${agent.description}`,
                    dbId: agent.id, // Store database ID
                    position: { x: index * 350 + 150, y: 150 },
                    order: agent.order || index
                }));

                const connections = canvasAgents.slice(0, -1).map((agent, index) => ({
                    from: agent.id,
                    to: canvasAgents[index + 1].id
                }));

                setCustomAgentData({
                    agents: canvasAgents,
                    connections: connections
                });

                setCurrentStep(0);
                setCompletedSteps([]);
            } else {
                message.error('Failed to load agents');
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
            message.error('Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    // Event handlers
    const handleTeamSelect = (teamId) => {
        const team = teams.find(t => t.id === teamId);
        setSelectedTeam(team);
        setCustomAgentData(null); // Start with empty canvas
        setViewMode('canvas'); // Go to canvas view
    };

    const handleCustomAgents = () => {
        setViewMode('canvas');
        setCustomAgentData(null); // Start with empty canvas
    };

    const handleCanvasComplete = (agentData) => {
        setCustomAgentData(agentData);

        // Convert canvas agent data back to traditional agent format
        if (agentData && agentData.agents) {
            const processedAgents = agentData.agents.map((agent, index) => ({
                key: agent.name.toLowerCase().replace(/\s+/g, '_'),
                title: agent.name,
                component: getAgentComponent(agent.name),
                description: agent.description,
                icon: getAgentIcon('FileTextOutlined'), // Default icon for canvas agents
                order: agent.order || index
            }));
            setAgents(processedAgents);
            setCurrentStep(0);
            setCompletedSteps([]);
        }

        setViewMode('team'); // Go to traditional agent view
    };

    const handleBackToCanvas = () => {
        setViewMode('canvas');
    };


    const handleStepClick = (index) => {
        const maxAccessibleStep = Math.max(...completedSteps, -1) + 1;
        if (index <= maxAccessibleStep) {
            setCurrentStep(index);
        }
    };

    const handleCompleteStep = () => {
        setShowCompleteModal(true);
    };

    const confirmCompleteStep = () => {
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps(prev => [...prev, currentStep]);
        }
        setShowCompleteModal(false);

        const isLastStep = currentStep === agents.length - 1;
        if (!isLastStep) {
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
            }, 500);
        }
    };

    const handleAgentComplete = (data) => {
        if (data) {
            setAgentData(prev => ({ ...prev, ...data }));
        }
    };

    const handleNext = () => {
        if (currentStep < agents.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGenerateWorkflow = async (userPrompt) => {
        try {
            console.log('Generating workflow for:', userPrompt);
            console.log('Selected team:', selectedTeam);

            const result = await workflowServices.generateWorkflow(
                userPrompt,
                selectedTeam?.id || null
            );

            if (result.success && result.data && result.data.data.workflowJson) {
                const workflowJson = result.data.data.workflowJson;
                console.log('Generated workflow JSON:', workflowJson);

                // Apply the generated workflow to the canvas
                setCustomAgentData(workflowJson);
                message.success('Workflow generated successfully!');

                return {
                    success: true,
                    workflowJson
                };
            } else {
                message.error(result.error || 'Failed to generate workflow');
                return {
                    success: false,
                    error: result.error
                };
            }
        } catch (error) {
            console.error('Error generating workflow:', error);
            message.error('Failed to generate workflow');
            return {
                success: false,
                error: error.message
            };
        }
    };

    // Computed values
    const currentAgent = agents[currentStep];
    const isCurrentStepCompleted = completedSteps.includes(currentStep);
    const isLastStep = currentStep === agents.length - 1;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: isDarkMode ? '#0a0a0a' : '#fafbfc'
        }}>
            {/* Header */}
            <MainDevHeader
                isDarkMode={isDarkMode}
                viewMode={viewMode}
                selectedTeam={selectedTeam}
                teams={teams}
                teamsLoading={teamsLoading}
                onTeamSelect={handleTeamSelect}
                onCustomAgents={handleCustomAgents}
            />

            {/* Progress Stepper - Only for team mode */}
            {viewMode === 'team' && agents.length > 0 && (
                <ProgressStepper
                    agents={agents}
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    isDarkMode={isDarkMode}
                    onStepClick={handleStepClick}
                />
            )}

            {/* Canvas Designer View - Full Width */}
            {viewMode === 'canvas' && (
                <div style={{
                    padding: '16px 24px 24px 24px'
                }}>
                    {loading ? (
                        <EmptyState
                            type="loading"
                            isDarkMode={isDarkMode}
                            teamName={selectedTeam?.name || 'agents'}
                        />
                    ) : (
                        <AgentCanvasDesigner
                            onComplete={handleCanvasComplete}
                            isDarkMode={isDarkMode}
                            initialAgentData={customAgentData}
                            selectedTeam={selectedTeam}
                            onAgentsUpdated={(updatedAgents) => {
                                // Optional: Handle agent list updates if needed
                            }}
                        />
                    )}
                </div>
            )}

            {/* Main Content - For non-canvas views */}
            {viewMode !== 'canvas' && (
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '24px 24px 24px 24px'
            }}>

                {/* Pipeline View */}
                {viewMode === 'pipeline' && (
                    <AgentPipelineView
                        agentData={customAgentData}
                        onEdit={handleBackToCanvas}
                        onBack={handleBackToCanvas}
                        isDarkMode={isDarkMode}
                    />
                )}

                {/* Team Selection View */}
                {viewMode === 'team' && (
                    <>
                        {/* Empty State */}
                        {!selectedTeam && (
                            <EmptyState
                                type="select"
                                isDarkMode={isDarkMode}
                            />
                        )}

                        {/* Loading State */}
                        {selectedTeam && loading && (
                            <EmptyState
                                type="loading"
                                isDarkMode={isDarkMode}
                                teamName={selectedTeam.name}
                            />
                        )}

                        {/* Team Agent Execution */}
                        {selectedTeam && !loading && agents.length > 0 && (
                            <TeamAgentView
                                currentAgent={currentAgent}
                                currentStep={currentStep}
                                agents={agents}
                                completedSteps={completedSteps}
                                agentData={agentData}
                                isDarkMode={isDarkMode}
                                isCurrentStepCompleted={isCurrentStepCompleted}
                                isLastStep={isLastStep}
                                onCompleteStep={handleCompleteStep}
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                onAgentComplete={handleAgentComplete}
                            />
                        )}
                    </>
                )}
            </div>
            )}

            {/* Completion Modal */}
            <Modal
                title="Complete Step"
                open={showCompleteModal}
                onOk={confirmCompleteStep}
                onCancel={() => setShowCompleteModal(false)}
                okText="Complete"
                cancelText="Cancel"
            >
                <p>Are you sure you want to mark this step as completed?</p>
            </Modal>

            {/* AI Chat Sidebar */}
            <AIChatSidebar
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                isDarkMode={isDarkMode}
                onGenerateWorkflow={handleGenerateWorkflow}
            />

            {/* Floating Chat Button (when sidebar is closed) */}
            {!isChatOpen && viewMode === 'canvas' && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        border: 'none',
                        color: 'white',
                        fontSize: 20,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                        zIndex: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default MainDev;