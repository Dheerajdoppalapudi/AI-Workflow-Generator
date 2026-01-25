import { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { message } from 'antd';
import { sdGenServices, workflowServices } from '../api/apiEndpoints';

// Component imports
import MainDevHeader from '../components/maindev/MainDevHeader';
import EmptyState from '../components/maindev/EmptyState';
import AgentCanvasDesigner from '../components/maindev/AgentCanvasDesigner';
import AIChatSidebar from '../components/maindev/AIChatSidebar';

const MainDev = () => {
    const { theme } = useContext(ThemeContext);
    const location = useLocation();
    const isDarkMode = theme === 'dark';

    // Core state
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    // Custom agent pipeline state
    const [customAgentData, setCustomAgentData] = useState(null);
    const [workflowLoaded, setWorkflowLoaded] = useState(false);

    // AI Chat sidebar state
    const [isChatOpen, setIsChatOpen] = useState(false);

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

    // Event handlers
    const handleTeamSelect = (teamId) => {
        const team = teams.find(t => t.id === teamId);
        setSelectedTeam(team);
        setCustomAgentData(null); // Start with empty canvas
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

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: isDarkMode ? '#0a0a0a' : '#fafbfc'
        }}>
            {/* Header */}
            <MainDevHeader
                isDarkMode={isDarkMode}
                selectedTeam={selectedTeam}
                teams={teams}
                teamsLoading={teamsLoading}
                onTeamSelect={handleTeamSelect}
            />

            {/* Canvas Designer View - Full Width */}
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
                        isDarkMode={isDarkMode}
                        initialAgentData={customAgentData}
                        selectedTeam={selectedTeam}
                        onAgentsUpdated={(updatedAgents) => {
                            // Optional: Handle agent list updates if needed
                        }}
                    />
                )}
            </div>

            {/* AI Chat Sidebar */}
            <AIChatSidebar
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                isDarkMode={isDarkMode}
                onGenerateWorkflow={handleGenerateWorkflow}
            />

            {/* Floating Chat Button (when sidebar is closed) */}
            {!isChatOpen && (
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