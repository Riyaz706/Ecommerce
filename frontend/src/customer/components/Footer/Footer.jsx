import React from 'react';
import { Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Grid container spacing={4} className="text-center md:text-left">

                    {/* Company Info */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="h6" className="font-bold mb-4 uppercase tracking-wider text-purple-500">
                            Company
                        </Typography>
                        <ul className="space-y-2">
                            {[
                                { name: 'About Us', href: '#' },
                                { name: 'Careers', href: '#' },
                                { name: 'Our Team', href: '#' },
                                { name: 'Press & Media', href: '#' }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link to={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    {/* Solutions / Products */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="h6" className="font-bold mb-4 uppercase tracking-wider text-purple-500">
                            Shop
                        </Typography>
                        <ul className="space-y-2">
                            {[
                                { name: 'Women', href: '/products/Women' },
                                { name: 'Men', href: '/products/Men' },
                                { name: 'Kids', href: '/products/Kids' },
                                { name: 'Beauty', href: '/products/Beauty' }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link to={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    {/* Legal / Support */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="h6" className="font-bold mb-4 uppercase tracking-wider text-purple-500">
                            Support
                        </Typography>
                        <ul className="space-y-2">
                            {[
                                { name: 'Contact Us', href: '#' },
                                { name: 'Order Status', href: '#' },
                                { name: 'Shipping Info', href: '#' },
                                { name: 'Returns', href: '#' }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link to={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                    {/* Legal */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="h6" className="font-bold mb-4 uppercase tracking-wider text-purple-500">
                            Legal
                        </Typography>
                        <ul className="space-y-2">
                            {[
                                { name: 'Terms & Conditions', href: '#' },
                                { name: 'Privacy Policy', href: '#' },
                                { name: 'Cookie Policy', href: '#' },
                                { name: 'Accessibility', href: '#' }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link to={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>

                </Grid>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Ecommerce, Inc. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        {/* Social Icons could go here */}
                        <span className="text-gray-500 text-sm">Made with ❤️ for Fashion</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
