import { Client, Account, Databases, ID, Query, Models } from 'appwrite';
import { config } from '../config';
import type { Idea, IdeaStatus } from '../types';

class AppwriteService {
  private client: Client;
  public account: Account;
  public databases: Databases;

  constructor() {
    this.client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
  }

  // ==================== Authentication Methods ====================

  async createAccount(email: string, password: string, name: string) {
    try {
      const response = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      // Automatically log in after creating account
      await this.login(email, password);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  }

  async login(email: string, password: string) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to login');
    }
  }

  async logout() {
    try {
      await this.account.deleteSession('current');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout');
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error: any) {
      return null;
    }
  }

  async updateName(name: string) {
    try {
      return await this.account.updateName(name);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update name');
    }
  }

  async updatePassword(password: string, oldPassword: string) {
    try {
      return await this.account.updatePassword(password, oldPassword);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update password');
    }
  }

  // ==================== Ideas CRUD Methods ====================

  async createIdea(
    title: string,
    description: string,
    status: IdeaStatus = 'Planning',
    tags: string[] = []
  ) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const ideaData = {
        title,
        description,
        status,
        tags,
        userId: user.$id,
      };

      return await this.databases.createDocument(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        ID.unique(),
        ideaData
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create idea');
    }
  }

  async getIdea(documentId: string): Promise<Idea> {
    try {
      const doc = await this.databases.getDocument(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        documentId
      );
      return doc as unknown as Idea;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get idea');
    }
  }

  async listIdeas(userId?: string): Promise<Idea[]> {
    try {
      const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];
      
      if (userId) {
        queries.push(Query.equal('userId', userId));
      }

      const response = await this.databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        queries
      );

      return response.documents as unknown as Idea[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to list ideas');
    }
  }

  async listIdeasByStatus(status: IdeaStatus, userId?: string): Promise<Idea[]> {
    try {
      const queries = [
        Query.equal('status', status),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ];
      
      if (userId) {
        queries.push(Query.equal('userId', userId));
      }

      const response = await this.databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        queries
      );

      return response.documents as unknown as Idea[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to list ideas by status');
    }
  }

  async searchIdeas(searchTerm: string, userId?: string): Promise<Idea[]> {
    try {
      const queries = [
        Query.search('title', searchTerm),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ];
      
      if (userId) {
        queries.push(Query.equal('userId', userId));
      }

      const response = await this.databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        queries
      );

      return response.documents as unknown as Idea[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search ideas');
    }
  }

  async updateIdea(
    documentId: string,
    data: Partial<{
      title: string;
      description: string;
      status: IdeaStatus;
      tags: string[];
    }>
  ): Promise<Idea> {
    try {
      const doc = await this.databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        documentId,
        data
      );
      return doc as unknown as Idea;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update idea');
    }
  }

  async deleteIdea(documentId: string) {
    try {
      return await this.databases.deleteDocument(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        documentId
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete idea');
    }
  }

  // ==================== Helper Methods ====================

  async getIdeasStats(userId?: string): Promise<{
    total: number;
    planning: number;
    inProgress: number;
    completed: number;
  }> {
    try {
      const ideas = await this.listIdeas(userId);
      
      return {
        total: ideas.length,
        planning: ideas.filter(i => i.status === 'Planning').length,
        inProgress: ideas.filter(i => i.status === 'In_Progress').length,
        completed: ideas.filter(i => i.status === 'Completed').length,
      };
    } catch (error: any) {
      return { total: 0, planning: 0, inProgress: 0, completed: 0 };
    }
  }
}

export const appwriteService = new AppwriteService();
