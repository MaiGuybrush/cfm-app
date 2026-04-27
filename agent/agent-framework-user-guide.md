# Microsoft Agent Framework - User Guide Reference

> **Document Version**: 10/02/2025  
> **Purpose**: AI Development Reference - Extracted from Official User Guide  
> **Target Audience**: Developers building AI agents and multi-agent workflows

---

## Table of Contents

1. [Overview](#overview)
2. [Agent Types](#agent-types)
3. [Creating Agents](#creating-agents)
4. [Running Agents](#running-agents)
5. [Multi-Turn Conversations](#multi-turn-conversations)
6. [Agent Tools & Function Calling](#agent-tools--function-calling)
7. [Agent Middleware](#agent-middleware)
8. [RAG (Retrieval Augmented Generation)](#rag-retrieval-augmented-generation)
9. [Custom Agents](#custom-agents)
10. [Best Practices](#best-practices)

---

## Overview

The Microsoft Agent Framework is an open-source development kit for building AI agents and multi-agent workflows for .NET and Python. It provides:

- **AI Agents**: Individual agents using LLMs to process inputs, call tools, and generate responses
- **Workflows**: Graph-based workflows connecting multiple agents for complex multi-step tasks
- **Foundation**: Model clients, agent threads for state management, context providers, middleware, and MCP clients

### Key Capabilities

- Support for Azure OpenAI, OpenAI, and Azure AI
- Function calling and tool integration
- Multi-turn conversations with history management
- Structured output generation
- Checkpointing for long-running processes
- Human-in-the-loop scenarios

---

## Agent Types

All agents derive from the `AIAgent` base class, providing a consistent interface across different implementations.

### Simple Agents Based on Inference Services

Any service implementing `Microsoft.Extensions.AI.IChatClient` can be used to build agents through `ChatClientAgent`.

**Supported Features:**
- Function calling
- Multi-turn conversations
- Custom service tools (MCP, Code Execution)
- Structured output

**Basic Creation:**
```csharp
using Microsoft.Agents.AI;

var agent = new ChatClientAgent(
    chatClient, 
    instructions: "You are a helpful assistant"
);
```

### Supported Service Types

| Service | Description | Service History | Custom History |
|---------|-------------|----------------|----------------|
| **Azure AI Foundry Agents** | Uses Azure AI Foundry Agents Service backend | ✅ Yes | ❌ No |
| **Azure AI Foundry Models (ChatCompletion)** | Uses models via ChatCompletion | ❌ No | ✅ Yes |
| **Azure AI Foundry Models (Responses)** | Uses models via Responses | ❌ No | ✅ Yes |
| **Azure OpenAI ChatCompletion** | Azure OpenAI ChatCompletion service | ❌ No | ✅ Yes |
| **Azure OpenAI Responses** | Azure OpenAI Responses service | ✅ Yes | ✅ Yes |
| **OpenAI ChatCompletion** | OpenAI ChatCompletion service | ❌ No | ✅ Yes |
| **OpenAI Responses** | OpenAI Responses service | ✅ Yes | ✅ Yes |
| **OpenAI Assistants** | OpenAI Assistants service | ✅ Yes | ❌ No |
| **Any IChatClient** | Custom implementations | Varies | Varies |

### Remote Agent Protocols

The framework supports connecting to remote agents via protocols like **A2A** (Agent-to-Agent).

---

## Creating Agents

### Azure OpenAI Example

```csharp
using Azure.AI.OpenAI;
using Azure.Identity;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;

// Create Azure OpenAI client
AIAgent agent = new AzureOpenAIClient(
    new Uri("https://<myresource>.openai.azure.com"),
    new AzureCliCredential())
        .GetChatClient("gpt-4o-mini")
        .CreateAIAgent(
            instructions: "You are good at telling jokes.", 
            name: "Joker"
        );
```

### Azure AI Foundry Agents Example

```csharp
using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Agents.AI;

// Create client
var client = new AIProjectClient(
    new Uri("https://<endpoint>.services.ai.azure.com"),
    new AzureCliCredential()
);

// Create agent
var agent = await client.CreateAgentAsync(
    model: "gpt-4o",
    instructions: "You are a helpful assistant",
    name: "MyAgent"
);

// Convert to AIAgent
AIAgent aiAgent = client.GetAIAgent(agent.Value.Id);
```

### OpenAI Example

```csharp
using OpenAI;
using Microsoft.Agents.AI;

var client = new OpenAIClient("your-api-key");
AIAgent agent = client
    .GetChatClient("gpt-4o-mini")
    .CreateAIAgent(
        instructions: "You are a helpful assistant",
        name: "Assistant"
    );
```

---

## Running Agents

### Basic Execution

```csharp
// Simple string input
Console.WriteLine(await agent.RunAsync("Tell me a joke about a pirate."));
```

### Streaming Response

```csharp
await foreach (var update in agent.RunStreamingAsync("Tell me a joke about a pirate."))
{
    Console.WriteLine(update);
}
```

### Using ChatMessage Objects

**Single User Message:**
```csharp
ChatMessage message = new(ChatRole.User, [
    new TextContent("Tell me a joke about this image?"),
    new UriContent(
        "https://upload.wikimedia.org/wikipedia/commons/1/11/Joseph_Grimaldi.jpg", 
        "image/jpeg"
    )
]);

Console.WriteLine(await agent.RunAsync(message));
```

**System and User Messages:**
```csharp
ChatMessage systemMessage = new(
    ChatRole.System,
    """
    If the user asks you to tell a joke, refuse to do so.
    Offer an interesting fact instead.
    """
);

ChatMessage userMessage = new(ChatRole.User, "Tell me a joke about a pirate.");

Console.WriteLine(await agent.RunAsync([systemMessage, userMessage]));
```

---

## Multi-Turn Conversations

Agents are **stateless** and require an `AgentThread` object to maintain conversation history.

### Creating and Using Threads

```csharp
// Create a new thread
AgentThread thread = agent.GetNewThread();

// First turn
Console.WriteLine(await agent.RunAsync("Tell me a joke about a pirate.", thread));

// Second turn (maintains context)
Console.WriteLine(await agent.RunAsync(
    "Now add some emojis to the joke and tell it in the voice of a pirate's parrot.", 
    thread
));
```

### Multiple Independent Conversations

```csharp
AgentThread thread1 = agent.GetNewThread();
AgentThread thread2 = agent.GetNewThread();

// Independent conversation 1
Console.WriteLine(await agent.RunAsync("Tell me a joke about a pirate.", thread1));

// Independent conversation 2
Console.WriteLine(await agent.RunAsync("Tell me a joke about a robot.", thread2));

// Continue conversation 1
Console.WriteLine(await agent.RunAsync(
    "Now add some emojis to the joke.", 
    thread1
));
```

### Thread Persistence

`AgentThread` instances can be serialized and stored for later use, enabling:
- Resuming conversations across sessions
- Distributed execution
- Long-running workflows

**Note**: For services like ChatCompletion, history is stored in the `AgentThread`. For services like Azure AI Foundry Agents, history is stored remotely with only a reference in the thread.

---

## Agent Tools & Function Calling

Agents can be extended with tools (functions) that they can call to perform actions.

### Defining Tools

Tools are C# methods decorated with description attributes for the LLM to understand their purpose.

```csharp
[Description("Gets the current weather for a location")]
public static string GetWeather(
    [Description("The city name")] string location
)
{
    // Implementation
    return $"Weather in {location}: Sunny, 72°F";
}
```

### Adding Tools to Agents

```csharp
var agent = chatClient.CreateAIAgent(
    instructions: "You are a helpful assistant with access to weather information.",
    name: "WeatherBot"
);

// Tools are automatically discovered and added based on the IChatClient implementation
```

### AgentRunOptions

While `AIAgent` accepts `AgentRunOptions` on its run methods, subclasses may define their own specific options:

```csharp
var options = new AgentRunOptions
{
    // Configuration specific to the agent type
};

await agent.RunAsync("What's the weather?", thread, options);
```

### MCP (Model Context Protocol) Integration

The framework supports MCP clients for tool integration, allowing agents to use external tools and services seamlessly.

---

## Agent Middleware

Middleware allows you to intercept and modify agent behavior at various stages of execution.

### Use Cases

- Logging and telemetry
- Input/output validation
- Authentication and authorization
- Rate limiting
- Custom processing logic

### Implementation Pattern

```csharp
public class LoggingMiddleware : IAgentMiddleware
{
    public async Task<AgentRunResponse> InvokeAsync(
        AgentRunContext context,
        AgentRunDelegate next
    )
    {
        // Pre-processing
        Console.WriteLine($"Input: {context.Input}");
        
        // Call next middleware or agent
        var response = await next(context);
        
        // Post-processing
        Console.WriteLine($"Output: {response.Text}");
        
        return response;
    }
}

// Add middleware to agent
agent.AddMiddleware(new LoggingMiddleware());
```

---

## RAG (Retrieval Augmented Generation)

RAG enhances agent responses by retrieving relevant information from external knowledge sources.

### Basic RAG Pattern

1. **Retrieve**: Query a vector database or search service for relevant documents
2. **Augment**: Add retrieved context to the agent's prompt
3. **Generate**: Agent generates response using the additional context

### Implementation Approach

```csharp
// Pseudo-code example
public async Task<string> AskWithRAG(string question, AIAgent agent)
{
    // 1. Retrieve relevant documents
    var documents = await vectorStore.SearchAsync(question, topK: 3);
    
    // 2. Augment prompt with context
    var context = string.Join("\n", documents.Select(d => d.Content));
    var augmentedPrompt = $"""
        Context:
        {context}
        
        Question: {question}
        
        Answer based on the context above.
        """;
    
    // 3. Generate response
    return await agent.RunAsync(augmentedPrompt);
}
```

### Context Providers

The framework includes context providers for agent memory, which can be used to implement RAG patterns and maintain long-term context across conversations.

---

## Custom Agents

For complete control over agent behavior, you can create custom agents by subclassing `AIAgent`.

### Basic Custom Agent Structure

```csharp
public class CustomAgent : AIAgent
{
    public CustomAgent(string name, string instructions)
        : base(name, instructions)
    {
    }
    
    public override async Task<AgentRunResponse> RunAsync(
        string input,
        AgentThread? thread = null,
        AgentRunOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        // Custom implementation
        var response = await ProcessInputAsync(input, thread, cancellationToken);
        return new AgentRunResponse(response);
    }
    
    public override async IAsyncEnumerable<AgentRunResponseUpdate> RunStreamingAsync(
        string input,
        AgentThread? thread = null,
        AgentRunOptions? options = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        // Custom streaming implementation
        var words = input.Split(' ');
        foreach (var word in words)
        {
            yield return new AgentRunResponseUpdate(word + " ");
            await Task.Delay(100, cancellationToken);
        }
    }
    
    public override AgentThread GetNewThread()
    {
        return new AgentThread();
    }
}
```

### Required Method Implementations

When creating a custom agent, you must implement:

1. **`RunAsync`**: Non-streaming agent execution
2. **`RunStreamingAsync`**: Streaming agent execution
3. **`GetNewThread`**: Creates a new conversation thread

If these methods are implemented correctly, your custom agent becomes a standard `AIAgent` compatible with all framework features including workflows and orchestrations.

---

## Best Practices

### 1. Security and Data Privacy

⚠️ **Important**: When using third-party servers or agents, you operate at your own risk. Review all data being shared and be aware of:
- Data retention practices
- Data location
- Compliance boundaries
- Organizational policies

### 2. Agent Design

- **Clear Instructions**: Provide specific, unambiguous instructions to agents
- **Appropriate Tools**: Only give agents access to tools they need
- **Error Handling**: Implement robust error handling in custom agents
- **State Management**: Use threads appropriately for conversation context

### 3. Performance Optimization

- **Streaming**: Use streaming for better perceived performance in interactive scenarios
- **Caching**: Leverage service-side history storage when available
- **Parallel Execution**: Design workflows to execute independent agents in parallel
- **Resource Cleanup**: Properly dispose of agents and threads when no longer needed

### 4. Testing and Debugging

- **Unit Testing**: Test agent logic independently of LLM calls
- **Middleware**: Use middleware for comprehensive logging
- **Telemetry**: Implement telemetry to monitor agent performance
- **Deterministic Testing**: Mock IChatClient implementations for consistent testing

### 5. Multi-Turn Conversations

- **Thread Management**: Create separate threads for independent conversations
- **Context Length**: Be aware of token limits when maintaining long conversation histories
- **Serialization**: Plan for thread persistence in production applications
- **State Validation**: Validate thread state before resuming conversations

### 6. Tool Integration

- **Clear Descriptions**: Provide detailed descriptions for functions and parameters
- **Error Messages**: Return clear error messages from tool functions
- **Validation**: Validate tool inputs before execution
- **Permissions**: Implement proper authorization for sensitive tools

---

## Quick Reference

### Common Patterns

**Create Agent:**
```csharp
var agent = chatClient.CreateAIAgent(instructions, name);
```

**Run Once:**
```csharp
var response = await agent.RunAsync(input);
```

**Multi-Turn:**
```csharp
var thread = agent.GetNewThread();
await agent.RunAsync(input1, thread);
await agent.RunAsync(input2, thread);
```

**Streaming:**
```csharp
await foreach (var update in agent.RunStreamingAsync(input))
{
    Console.Write(update);
}
```

### Required NuGet Packages

For Azure OpenAI:
```bash
dotnet add package Azure.Identity
dotnet add package Azure.AI.OpenAI
dotnet add package Microsoft.Agents.AI.OpenAI --prerelease
```

For Azure AI Foundry:
```bash
dotnet add package Azure.Identity
dotnet add package Azure.AI.Projects
dotnet add package Microsoft.Agents.AI.Azure --prerelease
```

For OpenAI:
```bash
dotnet add package OpenAI
dotnet add package Microsoft.Agents.AI.OpenAI --prerelease
```

---

## Additional Resources

- **Official Documentation**: See full framework documentation for advanced topics
- **Sample Code**: Check the tutorials section for step-by-step examples
- **API Reference**: Detailed API documentation for all classes and methods
- **Community**: Join discussions and get support from the community

---

## Document Notes

**Extraction Date**: 2025-12-09  
**Source**: Microsoft Agent Framework User Guide (PDF)  
**Pages Covered**: User Guide section (pages 137-236)  
**Format**: Optimized for AI development reference

This document is a condensed reference extracted from the official User Guide. For complete details, workflows, advanced scenarios, and updates, refer to the official Microsoft Agent Framework documentation.
