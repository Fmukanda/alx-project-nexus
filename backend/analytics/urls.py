from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('sales/overview/', views.SalesOverviewView.as_view(), name='sales-overview'),
    path('products/performance/', views.ProductPerformanceView.as_view(), name='product-performance'),
    path('customer/behavior/', views.CustomerBehaviorView.as_view(), name='customer-behavior'),
    path('engagement/metrics/', views.EngagementMetricsView.as_view(), name='engagement-metrics'),
]