import random
import decimal
import uuid
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.db import transaction
from faker import Faker
from products.models import Category, Product, ProductImage, ProductVariant
from orders.models import Order, OrderItem
from users.models import User
from analytics.models import PageView, ProductClick, CartActivity, OrderAnalytics
from payments.models import PaymentMethod, Payment, Transaction, Refund, MpesaTransaction
from reviews.models import Review

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with Kenyan fashion enterprise data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=300,
            help='Number of users to create'
        )
        parser.add_argument(
            '--products',
            type=int,
            default=200,
            help='Number of products to create'
        )
        parser.add_argument(
            '--orders',
            type=int,
            default=500,
            help='Number of orders to create'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding'
        )
    
    def handle(self, *args, **options):
        self.stdout.write('Starting to seed Kenyan fashion enterprise data...')
        
        # Use transaction to ensure data integrity
        with transaction.atomic():
            if options['clear']:
                self.clear_existing_data()
            
            # Create data
            groups = self.create_groups_and_permissions()
            categories = self.create_categories()
            users = self.create_users(options['users'], groups)
            products = self.create_products(options['products'], categories)
            variants = self.create_product_variants(products)
            reviews = self.create_reviews(products, users)
            orders = self.create_orders(options['orders'], users, products, variants)
            order_items = self.create_order_items(orders, products, variants)
            payments = self.create_payments(orders, users)
            transactions = self.create_transactions(payments)
            refunds = self.create_refunds(payments, orders)
            order_analytics = self.create_order_analytics(orders, payments)
            analytics_data = self.create_analytics_data(users, products, orders)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully seeded Kenyan fashion enterprise database with:\n'
                    f'  - {len(groups)} groups\n'
                    f'  - {len(categories)} categories\n'
                    f'  - {len(users)} users\n'
                    f'  - {len(products)} products\n'
                    f'  - {len(variants)} product variants\n'
                    f'  - {len(reviews)} reviews\n'
                    f'  - {len(orders)} orders\n'
                    f'  - {len(order_items)} order items\n'
                    f'  - {len(payments)} payments\n'
                    f'  - {len(transactions)} transactions\n'
                    f'  - {len(refunds)} refunds\n'
                    f'  - {len(order_analytics)} order analytics\n'
                    f'  - {sum(len(data) for data in analytics_data.values())} analytics records\n'
                    f'Total: {self.count_total_records()} records created!'
                )
            )
    
    def clear_existing_data(self):
        """Clear existing data to avoid conflicts"""
        self.stdout.write('Clearing existing data...')
        
        # Clear data in reverse order to respect foreign key constraints
        models_to_clear = [
            OrderAnalytics, CartActivity, ProductClick, PageView,
            MpesaTransaction, Refund, Transaction, Payment, PaymentMethod, OrderItem, Order,
            Review, ProductVariant, ProductImage, Product, Category
        ]
        
        for model in models_to_clear:
            count = model.objects.count()
            model.objects.all().delete()
            if count > 0:
                self.stdout.write(f'  - Deleted {count} {model.__name__} records')
        
        # Clear custom groups (but keep default ones)
        Group.objects.filter(name__in=['Customers', 'Vendors', 'Content Managers']).delete()
    
    def count_total_records(self):
        """Count total records created across all models"""
        models = [Category, User, Product, ProductVariant, Review, Order, OrderItem, 
                 PaymentMethod, Payment, Transaction, Refund, PageView, ProductClick, 
                 CartActivity, OrderAnalytics, Group]
        return sum(model.objects.count() for model in models)
    
    def create_groups_and_permissions(self):
        """Create user groups and assign permissions"""
        self.stdout.write('Creating user groups and permissions...')
        
        groups_data = [
            {
                'name': 'Customers',
                'permissions': [
                    'add_review', 'view_review', 'delete_review',
                    'add_order', 'view_order', 
                    'view_payment', 'view_product', 'view_category',
                ]
            },
            {
                'name': 'Vendors', 
                'permissions': [
                    'add_product', 'change_product', 'view_product',
                    'add_category', 'view_category',
                    'view_order', 'change_order',
                    'view_payment', 'view_analytics',
                ]
            },
            {
                'name': 'Content Managers',
                'permissions': [
                    'add_product', 'change_product', 'delete_product', 'view_product',
                    'add_category', 'change_category', 'delete_category', 'view_category',
                    'add_review', 'change_review', 'delete_review', 'view_review',
                    'view_order', 'view_payment', 'view_analytics',
                ]
            }
        ]
        
        groups = []
        for group_data in groups_data:
            group, created = Group.objects.get_or_create(name=group_data['name'])
            if created:
                # Add permissions to group - using filter().first() to avoid MultipleObjectsReturned
                permissions_added = 0
                for perm_codename in group_data['permissions']:
                    try:
                        # Use filter().first() instead of get() to handle duplicates
                        perm = Permission.objects.filter(codename=perm_codename).first()
                        if perm:
                            group.permissions.add(perm)
                            permissions_added += 1
                        else:
                            self.stdout.write(f'  - Warning: Permission {perm_codename} not found')
                    except Exception as e:
                        self.stdout.write(f'  - Error adding permission {perm_codename}: {e}')
                        continue
                
                groups.append(group)
                self.stdout.write(f'  - Created group: {group.name} with {permissions_added} permissions')
            else:
                groups.append(group)
                self.stdout.write(f'  - Group already exists: {group.name}')
        
        return groups
    
    def create_categories(self):
        self.stdout.write('Creating Kenyan fashion categories...')
        
        categories_data = [
            # Custom Wear
            {'name': 'Custom Made Dresses', 'slug': 'custom-dresses', 'description': 'Bespoke dresses tailored to your measurements'},
            {'name': 'Custom Suits & Blazers', 'slug': 'custom-suits', 'description': 'Tailored suits and blazers for perfect fit'},
            {'name': 'Traditional Attire', 'slug': 'traditional-attire', 'description': 'Custom-made traditional Kenyan outfits'},
            
            # Ready-to-Wear
            {'name': 'Women\'s Ready-to-Wear', 'slug': 'womens-ready-wear', 'description': 'Ready-made fashionable women\'s clothing'},
            {'name': 'Men\'s Ready-to-Wear', 'slug': 'mens-ready-wear', 'description': 'Ready-made stylish men\'s clothing'},
            {'name': 'Children\'s Clothing', 'slug': 'childrens-clothing', 'description': 'Fashionable clothing for children'},
            
            # Bridal Wear
            {'name': 'Bridal Gowns', 'slug': 'bridal-gowns', 'description': 'Exquisite wedding dresses for the special day'},
            {'name': 'Bridal Party Attire', 'slug': 'bridal-party', 'description': 'Outfits for bridesmaids and groomsmen'},
            {'name': 'Traditional Wedding Attire', 'slug': 'traditional-wedding', 'description': 'Cultural wedding outfits'},
            
            # Soft Furnishings
            {'name': 'African Print Curtains', 'slug': 'african-print-curtains', 'description': 'Vibrant African print curtains'},
            {'name': 'Throw Pillows', 'slug': 'throw-pillows', 'description': 'Decorative pillows with Kenyan designs'},
            {'name': 'Table Runners & Linens', 'slug': 'table-linens', 'description': 'Beautiful table dressings'},
            {'name': 'Bedding Sets', 'slug': 'bedding-sets', 'description': 'Complete bedding with African motifs'},
            
            # Women Accessories
            {'name': 'African Print Handbags', 'slug': 'african-print-bags', 'description': 'Stylish handbags with authentic prints'},
            {'name': 'Headwraps & Gele', 'slug': 'headwraps-gele', 'description': 'Beautiful headwraps and traditional gele'},
            {'name': 'Statement Jewelry', 'slug': 'statement-jewelry', 'description': 'Bold African-inspired jewelry'},
            {'name': 'Shoes & Footwear', 'slug': 'womens-footwear', 'description': 'Fashionable shoes and sandals'},
            
            # Men's Fashion
            {'name': 'Men\'s Traditional Wear', 'slug': 'mens-traditional', 'description': 'Traditional Kenyan men\'s clothing'},
            {'name': 'Men\'s Modern Fashion', 'slug': 'mens-modern', 'description': 'Contemporary men\'s fashion'},
            {'name': 'Men\'s Accessories', 'slug': 'mens-accessories', 'description': 'Belts, hats, and men\'s accessories'},
        ]
        
        categories = []
        for data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=data['slug'],
                defaults=data
            )
            categories.append(category)
        
        return categories
    
    def create_users(self, count, groups):
        self.stdout.write(f'Creating {count} users...')
        
        users = []
        fake = Faker()
        
        # Kenyan names data
        kenyan_first_names_male = ['John', 'James', 'David', 'Michael', 'Peter', 'Paul', 'Joseph', 'Robert', 'William', 'Charles',
                                  'Kamau', 'Mwangi', 'Kipchoge', 'Omondi', 'Odhiambo', 'Kariuki', 'Nyong\'o', 'Kenyatta', 'Odinga']
        kenyan_first_names_female = ['Mary', 'Grace', 'Faith', 'Hope', 'Joy', 'Anne', 'Jane', 'Susan', 'Elizabeth', 'Margaret',
                                    'Wanjiru', 'Nyambura', 'Akinyi', 'Atieno', 'Adhiambo', 'Muthoni', 'Wambui', 'Njeri', 'Nyaguthii']
        kenyan_last_names = ['Maina', 'Kamau', 'Mwangi', 'Kariuki', 'Nyong\'o', 'Omondi', 'Odhiambo', 'Kipchoge', 'Kenyatta', 
                            'Odinga', 'Kibaki', 'Moi', 'Mugo', 'Waweru', 'Korir', 'Rotich', 'Kiplagat', 'Koskei']
        
        # Get all existing usernames to avoid conflicts
        existing_usernames = set(User.objects.values_list('username', flat=True))
        existing_emails = set(User.objects.values_list('email', flat=True))
        
        # Create admin user
        admin_username = 'admin'
        admin_email = 'admin@kenyanfashion.com'
        
        if admin_username not in existing_usernames and admin_email not in existing_emails:
            admin_user = User.objects.create(
                email=admin_email,
                username=admin_username,
                first_name='Nyambura',
                last_name='Wanjiku',
                is_staff=True,
                is_superuser=True,
                email_verified=True,
                phone='+254700000000',
                address='Nairobi, Kenya',
            )
            admin_user.set_password('admin123')
            admin_user.save()
            users.append(admin_user)
            existing_usernames.add(admin_username)
            existing_emails.add(admin_email)
            self.stdout.write('  - Created admin user')
        else:
            admin_user = User.objects.get(username=admin_username)
            users.append(admin_user)
            self.stdout.write('  - Admin user already exists')
        
        # Create staff users and assign to groups
        staff_groups = [g for g in groups if g.name in ['Vendors', 'Content Managers']]
        for i in range(5):
            is_male = random.choice([True, False])
            first_name = random.choice(kenyan_first_names_male if is_male else kenyan_first_names_female)
            last_name = random.choice(kenyan_last_names)
            
            staff_username = f'staff{i}'
            staff_email = f'staff{i}@kenyanfashion.com'
            
            if staff_username not in existing_usernames and staff_email not in existing_emails:
                staff_user = User.objects.create(
                    email=staff_email,
                    username=staff_username,
                    first_name=first_name,
                    last_name=last_name,
                    is_staff=True,
                    email_verified=True,
                    phone=f'+2547{random.randint(10, 99)}{random.randint(100000, 999999)}',
                    address=fake.address(),
                    date_of_birth=fake.date_of_birth(minimum_age=25, maximum_age=60),
                )
                staff_user.set_password('staff123')
                staff_user.save()
                
                # Assign to random staff group
                if staff_groups:
                    staff_user.groups.add(random.choice(staff_groups))
                
                users.append(staff_user)
                existing_usernames.add(staff_username)
                existing_emails.add(staff_email)
        
        # Create regular users with guaranteed unique usernames
        kenyan_towns = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega']
        customer_group = Group.objects.filter(name='Customers').first()
        
        users_created = 0
        max_attempts = count * 10
        
        while users_created < count - len(users) and max_attempts > 0:
            max_attempts -= 1
            
            is_male = random.choice([True, False])
            first_name = random.choice(kenyan_first_names_male if is_male else kenyan_first_names_female)
            last_name = random.choice(kenyan_last_names)
            
            # Generate completely unique username using UUID
            base_username = f'{first_name.lower()}{last_name.lower()}'
            username = f"{base_username}_{uuid.uuid4().hex[:8]}"
            
            # Generate unique email
            email = f'{username}@example.com'
            
            # Double-check uniqueness
            if username in existing_usernames or User.objects.filter(username=username).exists():
                continue
                
            if email in existing_emails or User.objects.filter(email=email).exists():
                continue
            
            try:
                user = User.objects.create(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    is_staff=False,
                    email_verified=random.choice([True, False]),
                    phone=f'+2547{random.randint(10, 99)}{random.randint(100000, 999999)}',
                    address=f'{random.randint(100, 999)} {fake.street_name()}, {random.choice(kenyan_towns)}, Kenya',
                    date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=80),
                    date_joined=fake.date_time_between(start_date='-2y', end_date='now'),
                )
                user.set_password('user123')
                user.save()
                
                # Assign to customer group
                if customer_group:
                    user.groups.add(customer_group)
                
                users.append(user)
                existing_usernames.add(username)
                existing_emails.add(email)
                users_created += 1
                
            except Exception as e:
                self.stdout.write(f'  - Error creating user: {e}')
                continue
        
        self.stdout.write(f'  - Created {users_created} regular users')
        return users
    
    def create_products(self, count, categories):
        self.stdout.write(f'Creating {count} Kenyan fashion products...')
        
        products = []
        fake = Faker()
        
        # Kenyan fashion brands and designers
        kenyan_brands = ['KikoRomeo', 'Sunsilks Africa', 'Mille Collines', 'Kisua', 'Maki Oh']
        
        # Kenyan fabrics and materials
        fabrics = ['Kitenge', 'Kente', 'Ankara', 'Bogolan', 'Adire', 'Shweshwe', 'Batik', 'Kanga']
        
        # Product names for different categories
        product_names = {
            'custom-dresses': ['Bespoke Kitenge Gown', 'Custom Ankara Dress', 'Tailored Kente Outfit'],
            'custom-suits': ['Bespoke Kente Suit', 'Custom Ankara Blazer', 'Tailored Traditional Suit'],
            'traditional-attire': ['Kanzu Set', 'Dashiki Outfit', 'Boubou Ensemble'],
            'womens-ready-wear': ['Ankara Maxi Dress', 'Kitenge Jumpsuit', 'African Print Blouse'],
            'mens-ready-wear': ['African Print Shirt', 'Kente Trousers', 'Ankara Shorts'],
            'childrens-clothing': ['Kids Ankara Dress', 'Children Kente Set', 'Baby Traditional Wear'],
            'bridal-gowns': ['Bridal Kente Gown', 'Traditional Wedding Dress', 'Ankara Bridal Outfit'],
            'bridal-party': ['Bridesmaid Ankara Dress', 'Groomsmen Kente Attire'],
            'traditional-wedding': ['Kikuyu Wedding Set', 'Luo Traditional Wedding', 'Kamba Wedding Attire'],
            'african-print-curtains': ['Kitenge Curtains', 'Ankara Window Dressings'],
            'throw-pillows': ['Kente Pillows', 'Ankara Cushions'],
            'table-linens': ['Kitenge Table Runner', 'Ankara Placemats'],
            'bedding-sets': ['Kente Duvet Cover', 'Ankara Bed Sheets'],
            'african-print-bags': ['Kitenge Handbag', 'Ankara Clutch'],
            'headwraps-gele': ['Traditional Gele', 'Ankara Headwrap'],
            'statement-jewelry': ['Beaded Necklace', 'Traditional Earrings'],
            'womens-footwear': ['Ankara Sandals', 'Beaded Shoes'],
            'mens-traditional': ['Kanzu Set', 'Dashiki Outfit'],
            'mens-modern': ['African Print Shirt', 'Kente Blazer'],
            'mens-accessories': ['Kente Bow Tie', 'Ankara Belt']
        }
        
        for i in range(count):
            category = random.choice(categories)
            gender = self.get_gender_for_category(category)
            brand = random.choice(kenyan_brands)
            fabric = random.choice(fabrics)
            
            # Price ranges based on category
            if 'custom' in category.slug or 'bridal' in category.slug:
                base_price = decimal.Decimal(random.uniform(5000, 50000))
            elif 'soft' in category.slug:
                base_price = decimal.Decimal(random.uniform(1500, 15000))
            else:
                base_price = decimal.Decimal(random.uniform(800, 8000))
            
            # 25% chance of being on sale
            on_sale = random.random() < 0.25
            sale_price = base_price * decimal.Decimal(0.7) if on_sale else None
            
            # Get appropriate product name
            category_slug = category.slug
            if category_slug in product_names:
                name = random.choice(product_names[category_slug]) + f" {fabric}"
            else:
                name = f"African Fashion {category.name} - {fabric}"
            
            # Generate unique slug
            unique_id = uuid.uuid4().hex[:8]
            slug = f'{category.slug}-{fabric.lower()}-{unique_id}'
            
            product = Product.objects.create(
                name=name,
                slug=slug,
                description=self.generate_kenyan_fashion_description(category, fabric),
                price=base_price,
                sale_price=sale_price,
                on_sale=on_sale,
                category=category,
                gender=gender,
                brand=brand,
                material=fabric,
                care_instructions=self.generate_care_instructions(fabric),
                is_active=True,
                created_at=fake.date_time_between(start_date='-1y', end_date='now'),
            )
            products.append(product)
        
        return products
    
    def get_gender_for_category(self, category):
        """Determine gender based on category"""
        category_slug = category.slug
        if any(word in category_slug for word in ['womens', 'bridal', 'bridesmaid']):
            return 'W'
        elif any(word in category_slug for word in ['mens', 'groomsmen']):
            return 'M'
        elif any(word in category_slug for word in ['childrens', 'kids', 'baby']):
            return 'U'
        else:
            return random.choice(['M', 'W', 'U'])
    
    def generate_kenyan_fashion_description(self, category, fabric):
        """Generate culturally appropriate descriptions"""
        return f"Beautiful {fabric} {category.name.lower()} showcasing authentic Kenyan design and craftsmanship. Perfect for special occasions and cultural celebrations."
    
    def generate_care_instructions(self, fabric):
        """Generate appropriate care instructions based on fabric"""
        if fabric in ['Kitenge', 'Ankara', 'Kente']:
            return "Hand wash in cold water. Do not wring. Iron inside out. Avoid direct sunlight."
        else:
            return "Machine wash cold. Tumble dry low. Iron on medium heat. Do not bleach."
    
    def create_product_variants(self, products):
        self.stdout.write('Creating product variants...')
        
        variants = []
        
        # Clothing sizes
        women_sizes = ['XS', 'S', 'M', 'L', 'XL']
        men_sizes = ['S', 'M', 'L', 'XL', 'XXL']
        children_sizes = ['2-3Y', '4-5Y', '6-7Y', '8-9Y']
        accessory_sizes = ['One Size']
        
        # African-inspired colors
        african_colors = ['Royal Blue', 'Sunset Orange', 'Gold', 'Emerald Green', 'Ruby Red', 'Purple']
        
        for product in products:
            # Determine appropriate sizes based on category
            category_slug = product.category.slug
            if any(word in category_slug for word in ['womens', 'bridal', 'dresses']):
                sizes = women_sizes
            elif any(word in category_slug for word in ['mens']):
                sizes = men_sizes
            elif any(word in category_slug for word in ['childrens', 'kids']):
                sizes = children_sizes
            else:
                sizes = accessory_sizes
            
            # Create 1-3 variants per product
            num_variants = random.randint(1, 3)
            for i in range(num_variants):
                # Generate unique SKU
                sku = f'KF{product.id:03d}-{i}-{uuid.uuid4().hex[:6]}'
                
                variant = ProductVariant.objects.create(
                    product=product,
                    size=random.choice(sizes),
                    color=random.choice(african_colors),
                    sku=sku,
                    stock_quantity=random.randint(5, 50),
                    is_active=True,
                )
                variants.append(variant)
        
        return variants
    
    def create_reviews(self, products, users):
        self.stdout.write('Creating product reviews...')
        
        reviews = []
        fake = Faker()
        
        # Kenyan-style review comments
        positive_comments = [
            "Beautiful fabric and perfect fit! The quality is amazing.",
            "Love the authentic Kenyan design. Got so many compliments!",
            "Excellent craftsmanship. True value for money.",
            "The colors are even more vibrant in person. Very happy with my purchase.",
            "Perfect for traditional ceremonies. Authentic and stylish.",
        ]
        
        for product in products:
            # Create 0-5 reviews per product
            num_reviews = random.randint(0, 5)
            non_staff_users = [u for u in users if not u.is_staff]
            
            if non_staff_users:
                review_users = random.sample(non_staff_users, min(num_reviews, len(non_staff_users)))
                
                for user in review_users:
                    if not Review.objects.filter(product=product, user=user).exists():
                        rating = random.choices([4, 5, 3], weights=[40, 35, 25])[0]  # Mostly positive
                        
                        review = Review.objects.create(
                            product=product,
                            user=user,
                            rating=rating,
                            title=fake.sentence(),
                            comment=random.choice(positive_comments),
                            is_approved=True,
                            created_at=fake.date_time_between(
                                start_date=product.created_at, 
                                end_date='now'
                            ),
                        )
                        reviews.append(review)
        
        return reviews
    
    def create_orders(self, count, users, products, variants):
        self.stdout.write(f'Creating {count} orders...')
        
        orders = []
        fake = Faker()
        order_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
        payment_statuses = ['pending', 'paid']
        
        # Kenyan payment methods
        payment_methods = ['M-Pesa', 'Card', 'Bank Transfer']
        
        # Kenyan counties
        kenyan_counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu']
        
        non_staff_users = [u for u in users if not u.is_staff]
        
        for i in range(min(count, len(non_staff_users))):
            user = non_staff_users[i]
            status = random.choice(order_statuses)
            payment_status = random.choice(payment_statuses)
            payment_method = random.choice(payment_methods)
            
            # Calculate dates based on status
            base_date = fake.date_time_between(start_date='-1y', end_date='now')
            paid_at = base_date + timedelta(hours=1) if payment_status == 'paid' else None
            shipped_at = base_date + timedelta(days=2) if status in ['shipped', 'delivered'] else None
            delivered_at = base_date + timedelta(days=5) if status == 'delivered' else None
            
            county = random.choice(kenyan_counties)
            
            # Generate unique order number
            order_number = f'KF{base_date.strftime("%Y%m%d")}{i:04d}{uuid.uuid4().hex[:4]}'
            
            order = Order.objects.create(
                user=user,
                order_number=order_number,
                status=status,
                payment_status=payment_status,
                # Shipping information
                shipping_first_name=user.first_name,
                shipping_last_name=user.last_name,
                shipping_address=f'{random.randint(100, 999)} {fake.street_name()}, {county}',
                shipping_city=county,
                shipping_state=county,
                shipping_zip_code=f'{random.randint(10000, 99999)}',
                shipping_country='Kenya',
                shipping_phone=user.phone,
                # Payment information
                payment_method=payment_method,
                payment_transaction_id=f'MPESA{random.randint(100000000, 999999999)}' if payment_method == 'M-Pesa' and payment_status == 'paid' else '',
                # Pricing (will be updated with order items)
                subtotal=decimal.Decimal('0.00'),
                shipping_cost=decimal.Decimal('0.00'),
                tax_amount=decimal.Decimal('0.00'),
                total=decimal.Decimal('0.00'),
                # Timestamps
                created_at=base_date,
                paid_at=paid_at,
                shipped_at=shipped_at,
                delivered_at=delivered_at,
            )
            orders.append(order)
        
        return orders
    
    def create_order_items(self, orders, products, variants):
        self.stdout.write('Creating order items...')
        
        order_items = []
        
        for order in orders:
            # Create 1-3 items per order
            num_items = random.randint(1, 3)
            order_products = random.sample(products, min(num_items, len(products)))
            
            order_subtotal = decimal.Decimal('0.00')
            
            for product in order_products:
                # Get available variants for this product
                available_variants = ProductVariant.objects.filter(product=product, stock_quantity__gt=0)
                variant = random.choice(list(available_variants)) if available_variants.exists() else None
                
                quantity = random.randint(1, 2)
                price = product.sale_price if product.on_sale else product.price
                total_price = price * quantity
                order_subtotal += total_price
                
                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    variant=variant,
                    quantity=quantity,
                    price=price,
                )
                order_items.append(order_item)
            
            # Update order pricing
            shipping_cost = decimal.Decimal(random.uniform(200, 800))
            tax_rate = decimal.Decimal('0.16')  # 16% VAT in Kenya
            tax_amount = order_subtotal * tax_rate
            
            order.subtotal = order_subtotal
            order.shipping_cost = shipping_cost
            order.tax_amount = tax_amount
            order.total = order_subtotal + shipping_cost + tax_amount
            order.save()
        
        return order_items
    
    def create_payments(self, orders, users):
        self.stdout.write('Creating payments data...')
        
        payments = []
        
        # Create M-Pesa payment methods for users
        for user in users:
            if random.random() < 0.7 and not user.is_staff:
                PaymentMethod.objects.create(
                    user=user,
                    type='wallet',
                    is_default=True,
                )
        
        # Create payments for paid orders
        for order in orders:
            if order.payment_status == 'paid':
                user_payment_methods = PaymentMethod.objects.filter(user=order.user)
                payment_method = user_payment_methods.first() if user_payment_methods.exists() else None
                
                payment = Payment.objects.create(
                    order=order,
                    user=order.user,
                    payment_method=payment_method,
                    amount=order.total,
                    currency='KES',
                    status='completed',
                    provider_payment_id=f'MPESA{random.randint(100000000, 999999999)}',
                    processed_at=order.paid_at,
                    created_at=order.created_at,
                )
                payments.append(payment)
        
        return payments
    
    def create_transactions(self, payments):
        """Create detailed transaction records for payments"""
        self.stdout.write('Creating transaction records...')
        
        transactions = []
        mpesa_transactions = []
        fake = Faker()
        
        # Transaction types and statuses
        transaction_types = ['payment', 'refund', 'authorization', 'capture']
        transaction_statuses = ['success', 'pending', 'failed']
        
        for payment in payments:
            # Create general transaction record for each payment
            transaction_type = random.choice(transaction_types)
            success = payment.status == 'completed'
            
            transaction = Transaction.objects.create(
                payment=payment,
                type=transaction_type,
                amount=payment.amount,
                currency=payment.currency,
                provider_transaction_id=f'PT_{uuid.uuid4().hex[:10]}',
                provider_data={
                    'simulated': True,
                    'payment_gateway': 'stripe',  # or whatever gateway you're simulating
                    'transaction_reference': f'REF_{uuid.uuid4().hex[:8]}'
                },
                success=success,
                error_message='' if success else 'Simulated payment failure',
            )
            transactions.append(transaction)
            
            # If payment method is M-Pesa, create MpesaTransaction
            if payment.order.payment_method == 'M-Pesa' and payment.status == 'completed':
                mpesa_transaction = MpesaTransaction.objects.create(
                    payment=payment,
                    phone_number=f'2547{random.randint(10, 99)}{random.randint(100000, 999999)}',
                    amount=payment.amount,
                    transaction_id=f'MPESA_{uuid.uuid4().hex[:8]}'.upper(),
                    merchant_request_id=f'MR_{uuid.uuid4().hex[:10]}',
                    checkout_request_id=f'CR_{uuid.uuid4().hex[:10]}',
                    result_code=0,  # 0 means success in M-Pesa
                    result_description='The service request is processed successfully',
                    status='successful',
                    completed_at=payment.processed_at
                )
                mpesa_transactions.append(mpesa_transaction)
        
        self.stdout.write(f'  - Created {len(mpesa_transactions)} M-Pesa transactions')
        return transactions

    def create_refunds(self, payments, orders):
        """Create refund records for some orders"""
        self.stdout.write('Creating refund records...')
        
        refunds = []
        fake = Faker()
        
        # Select 10% of paid orders for refunds
        refund_orders = random.sample(
            [order for order in orders if order.payment_status == 'paid'],
            max(1, len(orders) // 10)
        )
        
        for order in refund_orders:
            payment = Payment.objects.filter(order=order).first()
            if payment:
                refund_amount = payment.amount * decimal.Decimal(random.uniform(0.5, 1.0))  # Partial or full refund
                
                refund = Refund.objects.create(
                    payment=payment,
                    amount=refund_amount,
                    reason=random.choice([
                        'Product damaged',
                        'Wrong item received',
                        'Customer changed mind',
                        'Size not fitting',
                        'Quality issues'
                    ]),
                    status=random.choice(['pending', 'processing', 'completed']),
                    provider_refund_id=f'RF_{uuid.uuid4().hex[:10]}' if random.choice([True, False]) else '',
                )
                
                # If refund is completed, create a refund transaction
                if refund.status == 'completed':
                    Transaction.objects.create(
                        payment=payment,
                        type='refund',
                        amount=refund.amount,
                        currency=payment.currency,
                        provider_transaction_id=f'REFUND_{uuid.uuid4().hex[:8]}',
                        provider_data={
                            'simulated': True,
                            'refund_reason': refund.reason,
                            'refund_id': str(refund.id)
                        },
                        success=True,
                    )
                
                refunds.append(refund)
        
        return refunds

    def create_order_analytics(self, orders, payments):
        """Create order analytics data that matches the actual model"""
        self.stdout.write('Creating order analytics...')
        
        order_analytics = []
        fake = Faker()
        
        # Define possible values for the actual model fields
        acquisition_channels = ['organic', 'social_media', 'email', 'paid_search', 'referral', 'direct']
        marketing_campaigns = ['spring_collection', 'summer_sale', 'black_friday', 'christmas_special', 'new_arrivals', 'influencer_campaign']
        
        # Track user's first purchase for each user
        user_first_purchase = {}
        
        for order in orders:
            # Calculate customer lifetime value (sum of all orders by this user up to this order)
            user_orders = Order.objects.filter(user=order.user, created_at__lte=order.created_at)
            customer_lifetime_value = sum([o.total for o in user_orders if o.total])
            
            # Calculate days to first purchase
            if order.user not in user_first_purchase:
                # This is the user's first order
                days_to_first_purchase = (order.created_at - order.user.date_joined).days
                user_first_purchase[order.user] = {
                    'first_order_date': order.created_at,
                    'days_to_first_purchase': days_to_first_purchase
                }
            else:
                # Not the first order, so days_to_first_purchase should be from the first order
                days_to_first_purchase = user_first_purchase[order.user]['days_to_first_purchase']
            
            analytics = OrderAnalytics.objects.create(
                order=order,
                acquisition_channel=random.choice(acquisition_channels),
                marketing_campaign=random.choice(marketing_campaigns),
                customer_lifetime_value=customer_lifetime_value,
                days_to_first_purchase=days_to_first_purchase,
            )
            order_analytics.append(analytics)
        
        return order_analytics
    
    def create_analytics_data(self, users, products, orders):
        self.stdout.write('Creating analytics data...')
        
        page_views = []
        product_clicks = []
        cart_activities = []
        fake = Faker()
        
        # Create substantial analytics data for 1000+ records
        for i in range(1500):
            user = random.choice([u for u in users if not u.is_staff]) if random.random() < 0.7 else None
            product = random.choice(products) if random.random() < 0.6 else None
            
            page_view = PageView.objects.create(
                user=user,
                product=product,
                page_url=f'/products/{product.slug}' if product else '/',
                session_key=fake.uuid4()[:20],
                ip_address=fake.ipv4(),
                timestamp=fake.date_time_between(start_date='-3m', end_date='now'),
            )
            page_views.append(page_view)
        
        for i in range(1200):
            user = random.choice([u for u in users if not u.is_staff]) if random.random() < 0.6 else None
            product = random.choice(products)
            
            product_click = ProductClick.objects.create(
                user=user,
                product=product,
                session_key=fake.uuid4()[:20],
                source_page=random.choice(['/category/womens-ready-wear', '/category/mens-ready-wear', '/']),
                timestamp=fake.date_time_between(start_date='-3m', end_date='now'),
            )
            product_clicks.append(product_click)
        
        for i in range(1300):
            user = random.choice([u for u in users if not u.is_staff]) if random.random() < 0.8 else None
            product = random.choice(products)
            
            cart_activity = CartActivity.objects.create(
                user=user,
                product=product,
                action=random.choice(['add', 'remove']),
                quantity=random.randint(1, 2),
                session_key=fake.uuid4()[:20],
                timestamp=fake.date_time_between(start_date='-3m', end_date='now'),
            )
            cart_activities.append(cart_activity)
        
        return {
            'page_views': page_views,
            'product_clicks': product_clicks,
            'cart_activities': cart_activities,
        }