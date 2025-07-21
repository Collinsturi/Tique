// import { Request, Response } from "express";
// import { AnalyticsController } from "../../../../src/components/analytics/analytics.controller"; // Adjust path as necessary
// import { AnalyticsService } from "../../../../src/components/analytics/analytics.service"; // Adjust path as necessary
//
// // Create a single mock instance of the service outside the jest.mock call.
// // This instance will be returned every time AnalyticsService is instantiated.
// const mockServiceInstance = {
//     AdminDashboardAnalytics: jest.fn(),
//     getPlatformSummary: jest.fn(),
//     getMonthlySalesTrends: jest.fn(),
//     getTopSellingEvents: jest.fn(),
//     getOverallTicketScanStatus: jest.fn(),
//     getEventTicketSummary: jest.fn(),
//     getEventScanLog: jest.fn(),
//     getTicketTypeDistribution: jest.fn(),
//     getEventScanStatus: jest.fn(),
//     getOrganizerEarningsSummary: jest.fn(),
//     getRevenuePerEvent: jest.fn(),
// } as jest.Mocked<AnalyticsService>; // type-safe mock object
//
// // Mock the entire AnalyticsService module to always return our specific mock instance
// jest.mock("../../../../src/components/analytics/analytics.service", () => ({
//     AnalyticsService: jest.fn(() => mockServiceInstance),
// }));
//
// // The 'const service = new AnalyticsService();' in the controller file will now
// // get the `mockServiceInstance` because of the `jest.mock` above.
//
// describe('AnalyticsController', () => {
//     let controller: AnalyticsController;
//     let mockRequest: Partial<Request>;
//     let mockResponse: Partial<Response>;
//
//     beforeEach(() => {
//         controller = new AnalyticsController();
//         // Reset all mocks on the *instance* that is actually used by the controller
//         // This ensures that each test starts with a clean slate for mockServiceInstance's methods.
//         jest.clearAllMocks();
//
//         // Initialize mock response object with jest.fn() for methods
//         mockResponse = {
//             json: jest.fn(),
//             status: jest.fn().mockReturnThis(), // Allow chaining .status().json()
//         };
//     });
//
//     describe('adminDashboard', () => {
//         it('should return 401 if admin email is missing', async () => {
//             mockRequest = { user: { email: undefined } as any }; // Mock user with no email
//
//             await controller.adminDashboard(mockRequest as Request, mockResponse as Response);
//
//             expect(mockResponse.status).toHaveBeenCalledWith(401);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
//             expect(mockServiceInstance.AdminDashboardAnalytics).not.toHaveBeenCalled(); // Use mockServiceInstance here
//         });
//
//         it('should return dashboard analytics on success', async () => {
//             const adminEmail = 'admin@example.com';
//             const mockResult = { totalEvents: 5, totalTicketsSold: 10 };
//             mockRequest = { user: { email: adminEmail } as any };
//             mockServiceInstance.AdminDashboardAnalytics.mockResolvedValueOnce(mockResult); // Use mockServiceInstance here
//
//             await controller.adminDashboard(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.AdminDashboardAnalytics).toHaveBeenCalledWith(adminEmail); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
//             expect(mockResponse.status).not.toHaveBeenCalled(); // Should not set status if successful (defaults to 200)
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const adminEmail = 'admin@example.com';
//             const errorMessage = 'Database error';
//             mockRequest = { user: { email: adminEmail } as any };
//             mockServiceInstance.AdminDashboardAnalytics.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.adminDashboard(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.AdminDashboardAnalytics).toHaveBeenCalledWith(adminEmail); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getPlatformSummary', () => {
//         it('should return platform summary on success', async () => {
//             const mockSummary = { totalEvents: 10, totalTicketsSold: 100 };
//             mockRequest = {};
//             mockServiceInstance.getPlatformSummary.mockResolvedValueOnce(mockSummary); // Use mockServiceInstance here
//
//             await controller.getPlatformSummary(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getPlatformSummary).toHaveBeenCalled(); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockSummary);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const errorMessage = 'Summary error';
//             mockRequest = {};
//             mockServiceInstance.getPlatformSummary.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getPlatformSummary(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getPlatformSummary).toHaveBeenCalled(); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getMonthlySalesTrends', () => {
//         it('should return monthly sales trends on success', async () => {
//             const mockTrends = [{ month: '2023-01', sales: 50 }];
//             mockRequest = {};
//             mockServiceInstance.getMonthlySalesTrends.mockResolvedValueOnce(mockTrends); // Use mockServiceInstance here
//
//             await controller.getMonthlySalesTrends(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getMonthlySalesTrends).toHaveBeenCalled(); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockTrends);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const errorMessage = 'Trends error';
//             mockRequest = {};
//             mockServiceInstance.getMonthlySalesTrends.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getMonthlySalesTrends(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getMonthlySalesTrends).toHaveBeenCalled(); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getTopSellingEvents', () => {
//         it('should return top selling events on success', async () => {
//             const mockEvents = [{ eventName: 'Concert', ticketsSold: 200 }];
//             mockRequest = {};
//             mockServiceInstance.getTopSellingEvents.mockResolvedValueOnce(mockEvents); // Use mockServiceInstance here
//
//             await controller.getTopSellingEvents(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getTopSellingEvents).toHaveBeenCalled(); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockEvents);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const errorMessage = 'Events error';
//             mockRequest = {};
//             mockServiceInstance.getTopSellingEvents.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getTopSellingEvents(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getTopSellingEvents).toHaveBeenCalled(); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getOverallTicketScanStatus', () => {
//         it('should return overall ticket scan status on success', async () => {
//             const mockStatus = { scanned: 70, notScanned: 30 };
//             mockRequest = {};
//             mockServiceInstance.getOverallTicketScanStatus.mockResolvedValueOnce(mockStatus); // Use mockServiceInstance here
//
//             await controller.getOverallTicketScanStatus(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getOverallTicketScanStatus).toHaveBeenCalled(); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockStatus);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const errorMessage = 'Scan status error';
//             mockRequest = {};
//             mockServiceInstance.getOverallTicketScanStatus.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getOverallTicketScanStatus(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getOverallTicketScanStatus).toHaveBeenCalled(); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getEventTicketSummary', () => {
//         it('should return event ticket summary on success', async () => {
//             const eventId = '123';
//             const mockSummary = [{ ticketType: 'VIP', totalSold: 10 }];
//             mockRequest = { params: { eventId } };
//             mockServiceInstance.getEventTicketSummary.mockResolvedValueOnce(mockSummary); // Use mockServiceInstance here
//
//             await controller.getEventTicketSummary(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getEventTicketSummary).toHaveBeenCalledWith(Number(eventId)); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockSummary);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const eventId = '123';
//             const errorMessage = 'Event summary error';
//             mockRequest = { params: { eventId } };
//             mockServiceInstance.getEventTicketSummary.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getEventTicketSummary(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getEventTicketSummary).toHaveBeenCalledWith(Number(eventId)); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getEventScanLog', () => {
//         it('should return event scan log on success', async () => {
//             const eventId = '123';
//             const mockLog = { totalScanned: 50, dailyScans: [] };
//             mockRequest = { params: { eventId } };
//             mockServiceInstance.getEventScanLog.mockResolvedValueOnce(mockLog); // Use mockServiceInstance here
//
//             await controller.getEventScanLog(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getEventScanLog).toHaveBeenCalledWith(Number(eventId)); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockLog);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const eventId = '123';
//             const errorMessage = 'Scan log error';
//             mockRequest = { params: { eventId } };
//             mockServiceInstance.getEventScanLog.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getEventScanLog(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getEventScanLog).toHaveBeenCalledWith(Number(eventId)); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getTicketTypeDistribution', () => {
//         it('should return ticket type distribution on success', async () => {
//             const eventId = '123';
//             const mockDistribution = [{ ticketType: 'Standard', countSold: 20 }];
//             mockRequest = { params: { eventId } };
//             mockServiceInstance.getTicketTypeDistribution.mockResolvedValueOnce(mockDistribution); // Use mockServiceInstance here
//
//             await controller.getTicketTypeDistribution(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getTicketTypeDistribution).toHaveBeenCalledWith(Number(eventId)); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockDistribution);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const eventId = '123';
//             const errorMessage = 'Distribution error';
//             mockRequest = { params: { eventId } };
//             mockServiceInstance.getTicketTypeDistribution.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getTicketTypeDistribution(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getTicketTypeDistribution).toHaveBeenCalledWith(Number(eventId)); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getEventScanStatus', () => {
//         it('should return event scan status on success', async () => {
//             const eventId = '123';
//             const mockStatus = { scannedCount: 80, notScannedCount: 20 };
//             mockRequest = { params: { eventId } };
//             mockServiceInstance.getEventScanStatus.mockResolvedValueOnce(mockStatus); // Use mockServiceInstance here
//
//             await controller.getEventScanStatus(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getEventScanStatus).toHaveBeenCalledWith(Number(eventId)); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockStatus);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const eventId = '123';
//             const errorMessage = 'Event scan status error';
//             mockRequest = { params: { eventId } };
//             mockServiceInstance.getEventScanStatus.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getEventScanStatus(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getEventScanStatus).toHaveBeenCalledWith(Number(eventId)); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getOrganizerEarningsSummary', () => {
//         it('should return 401 if user ID is missing', async () => {
//             mockRequest = { user: { id: undefined } as any }; // Mock user with no ID
//
//             await controller.getOrganizerEarningsSummary(mockRequest as Request, mockResponse as Response);
//
//             expect(mockResponse.status).toHaveBeenCalledWith(401);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
//             expect(mockServiceInstance.getOrganizerEarningsSummary).not.toHaveBeenCalled(); // Use mockServiceInstance here
//         });
//
//         it('should return organizer earnings summary on success', async () => {
//             const userId = 1;
//             const mockSummary = { totalEarnings: 5000, totalWithdrawn: 0, availableBalance: 5000 };
//             mockRequest = { user: { id: userId } as any };
//             mockServiceInstance.getOrganizerEarningsSummary.mockResolvedValueOnce(mockSummary); // Use mockServiceInstance here
//
//             await controller.getOrganizerEarningsSummary(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getOrganizerEarningsSummary).toHaveBeenCalledWith(Number(userId)); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockSummary);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const userId = 1;
//             const errorMessage = 'Earnings summary error';
//             mockRequest = { user: { id: userId } as any };
//             mockServiceInstance.getOrganizerEarningsSummary.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getOrganizerEarningsSummary(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getOrganizerEarningsSummary).toHaveBeenCalledWith(Number(userId)); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
//
//     describe('getRevenuePerEvent', () => {
//         it('should return 401 if user ID is missing', async () => {
//             mockRequest = { user: { id: undefined } as any }; // Mock user with no ID
//
//             await controller.getRevenuePerEvent(mockRequest as Request, mockResponse as Response);
//
//             expect(mockResponse.status).toHaveBeenCalledWith(401);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
//             expect(mockServiceInstance.getRevenuePerEvent).not.toHaveBeenCalled(); // Use mockServiceInstance here
//         });
//
//         it('should return revenue per event on success', async () => {
//             const userId = 1;
//             const mockRevenue = [{ eventName: 'Concert', revenue: 1000 }];
//             mockRequest = { user: { id: userId } as any };
//             mockServiceInstance.getRevenuePerEvent.mockResolvedValueOnce(mockRevenue); // Use mockServiceInstance here
//
//             await controller.getRevenuePerEvent(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getRevenuePerEvent).toHaveBeenCalledWith(Number(userId)); // Use mockServiceInstance here
//             expect(mockResponse.json).toHaveBeenCalledWith(mockRevenue);
//             expect(mockResponse.status).not.toHaveBeenCalled();
//         });
//
//         it('should return 500 if service throws an error', async () => {
//             const userId = 1;
//             const errorMessage = 'Revenue per event error';
//             mockRequest = { user: { id: userId } as any };
//             mockServiceInstance.getRevenuePerEvent.mockRejectedValueOnce(new Error(errorMessage)); // Use mockServiceInstance here
//
//             await controller.getRevenuePerEvent(mockRequest as Request, mockResponse as Response);
//
//             expect(mockServiceInstance.getRevenuePerEvent).toHaveBeenCalledWith(Number(userId)); // Use mockServiceInstance here
//             expect(mockResponse.status).toHaveBeenCalledWith(500);
//             expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
//         });
//     });
// });
