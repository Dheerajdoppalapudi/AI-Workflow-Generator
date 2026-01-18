import db from "../utils/prisma.js";

/**
 * Create a new workflow
 * POST /api/sdgen/workflows
 */
export const createWorkflow = async (req, res) => {
  try {
    const { name, description, teamId, workflowData, thumbnail } = req.body;
    // Temporarily use hardcoded userId for testing (user ID 1)
    const userId = req.user?.id || 1;

    // Remove this check temporarily for testing
    // if (!userId) {
    //   return res.status(401).json({
    //     error: "Unauthorized - user authentication required",
    //     success: false
    //   });
    // }

    if (!name || !workflowData) {
      return res.status(400).json({
        error: "Workflow name and workflow data are required",
        success: false
      });
    }

    // Validate workflowData is valid JSON if it's a string
    let validatedWorkflowData = workflowData;
    if (typeof workflowData === 'object') {
      validatedWorkflowData = JSON.stringify(workflowData);
    } else if (typeof workflowData === 'string') {
      try {
        JSON.parse(workflowData);
      } catch (error) {
        return res.status(400).json({
          error: "Invalid workflow data format - must be valid JSON",
          success: false
        });
      }
    }

    const workflow = await db.workflow.create({
      data: {
        name,
        description: description || null,
        userId,
        teamId: teamId ? parseInt(teamId) : null,
        workflowData: validatedWorkflowData,
        thumbnail: thumbnail || null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Workflow created successfully",
      data: {
        workflow
      }
    });
  } catch (error) {
    console.error("Error creating workflow:", error);
    res.status(500).json({
      error: "Internal server error while creating workflow",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all workflows for the authenticated user
 * GET /api/sdgen/workflows
 */
export const getWorkflowsByUser = async (req, res) => {
  try {
    // Temporarily use hardcoded userId for testing (user ID 1)
    const userId = req.user?.id || 1;

    const workflows = await db.workflow.findMany({
      where: {
        userId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        workflows
      },
      count: workflows.length
    });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    res.status(500).json({
      error: "Internal server error while fetching workflows",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a specific workflow by ID
 * GET /api/sdgen/workflows/:id
 */
export const getWorkflowById = async (req, res) => {
  try {
    const { id } = req.params;
    // Temporarily use hardcoded userId for testing (user ID 1)
    const userId = req.user?.id || 1;

    // Remove this check temporarily for testing
    // if (!userId) {
    //   return res.status(401).json({
    //     error: "Unauthorized - user authentication required",
    //     success: false
    //   });
    // }

    const workflow = await db.workflow.findFirst({
      where: {
        id: parseInt(id),
        userId // Ensure user can only access their own workflows
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!workflow) {
      return res.status(404).json({
        error: "Workflow not found or you don't have permission to access it",
        success: false
      });
    }

    res.status(200).json({
      success: true,
      data: {
        workflow
      }
    });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    res.status(500).json({
      error: "Internal server error while fetching workflow",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a workflow
 * PUT /api/sdgen/workflows/:id
 */
export const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, teamId, workflowData, thumbnail } = req.body;
    // Temporarily use hardcoded userId for testing (user ID 1)
    const userId = req.user?.id || 1;

    // Remove this check temporarily for testing
    // if (!userId) {
    //   return res.status(401).json({
    //     error: "Unauthorized - user authentication required",
    //     success: false
    //   });
    // }

    // Check if workflow exists and belongs to user
    const existingWorkflow = await db.workflow.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingWorkflow) {
      return res.status(404).json({
        error: "Workflow not found or you don't have permission to update it",
        success: false
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (teamId !== undefined) updateData.teamId = teamId ? parseInt(teamId) : null;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    if (workflowData !== undefined) {
      let validatedWorkflowData = workflowData;
      if (typeof workflowData === 'object') {
        validatedWorkflowData = JSON.stringify(workflowData);
      } else if (typeof workflowData === 'string') {
        try {
          JSON.parse(workflowData);
        } catch (error) {
          return res.status(400).json({
            error: "Invalid workflow data format - must be valid JSON",
            success: false
          });
        }
      }
      updateData.workflowData = validatedWorkflowData;
    }

    const workflow = await db.workflow.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Workflow updated successfully",
      data: {
        workflow
      }
    });
  } catch (error) {
    console.error("Error updating workflow:", error);
    res.status(500).json({
      error: "Internal server error while updating workflow",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a workflow
 * DELETE /api/sdgen/workflows/:id
 */
export const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    // Temporarily use hardcoded userId for testing (user ID 1)
    const userId = req.user?.id || 1;

    // Remove this check temporarily for testing
    // if (!userId) {
    //   return res.status(401).json({
    //     error: "Unauthorized - user authentication required",
    //     success: false
    //   });
    // }

    // Check if workflow exists and belongs to user
    const existingWorkflow = await db.workflow.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingWorkflow) {
      return res.status(404).json({
        error: "Workflow not found or you don't have permission to delete it",
        success: false
      });
    }

    await db.workflow.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: "Workflow deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    res.status(500).json({
      error: "Internal server error while deleting workflow",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
