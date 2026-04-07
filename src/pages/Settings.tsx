import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { updateUser } from '@/lib/storage';
import { toast } from 'sonner';
import {
    Moon, Sun, Monitor, User, Lock, HelpCircle, MessageSquare,
    BookOpen, Send, Ticket, Eye, EyeOff, CheckCircle2, Shield,
    Bot, Loader2, FileText, Scale, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleGenerativeAI } from '@google/generative-ai';

/* ─── Theme utility ───────────────────────────────────────────────── */
type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    root.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem('theme', theme);
}

function getStoredTheme(): Theme {
    return (localStorage.getItem('theme') as Theme) || 'system';
}

/* ─── AI Chatbot logic ─────────────────────────────────────────────── */
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const getAIResponse = async (query: string): Promise<string> => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            return "API Key not found. Please add VITE_GEMINI_API_KEY to your .env file.";
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are a specialized Procurement Assistant for the Philippine Government. You focus EXCLUSIVELY on RA 9184, RA 12009, Implementing Rules and Regulations (IRR), Process Flow guides, Small Value Procurement (SVP), Shopping, Competitive Bidding, Bids and Awards Committee (BAC), and PhilGEPS. If a user asks about anything unrelated to procurement, politely decline and steer them back to procurement topics. Be concise, professional, and helpful."
        });

        const result = await model.generateContent(query);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    }
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Theme
    const [theme, setTheme] = useState<Theme>(getStoredTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Change Password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    // Profile
    const [profileName, setProfileName] = useState(user?.name || '');
    const [savingProfile, setSavingProfile] = useState(false);

    // Ticket
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketBody, setTicketBody] = useState('');
    const [sendingTicket, setSendingTicket] = useState(false);
    const [ticketSent, setTicketSent] = useState(false);

    // AI Chat
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: 'Hello! I\'m your Procurement Assistant. You can ask me about RA 9184, RA 12009, IRR procedures, SVP, Shopping, Competitive Bidding, BAC, and PhilGEPS.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendChat = async () => {
        if (!chatInput.trim()) return;
        const userMsg: ChatMessage = { role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);

        const resp = await getAIResponse(userMsg.content);
        setChatMessages(prev => [...prev, { role: 'assistant', content: resp }]);
        setChatLoading(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (currentPassword !== user.password) {
            toast.error('Current password is incorrect');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setSavingPw(true);
        try {
            await updateUser(user.id, { password: newPassword });
            toast.success('Password changed successfully');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch {
            toast.error('Failed to change password');
        } finally {
            setSavingPw(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSavingProfile(true);
        try {
            await updateUser(user.id, { name: profileName });
            toast.success('Profile updated');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketSubject.trim() || !ticketBody.trim()) {
            toast.error('Please fill in all fields');
            return;
        }
        setSendingTicket(true);
        await new Promise(r => setTimeout(r, 1000));
        setSendingTicket(false);
        setTicketSent(true);
        setTicketSubject(''); setTicketBody('');
        toast.success('Ticket submitted successfully!');
        setTimeout(() => setTicketSent(false), 4000);
    };

    const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-xl font-semibold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your account, preferences, and system options.</p>
            </div>

            <Tabs defaultValue="appearance" className="space-y-4">
                <TabsList className="h-9 rounded-md border border-border bg-muted/50 p-0.5">
                    {[
                        { value: 'appearance', label: 'Appearance', icon: Monitor },
                        { value: 'profile', label: 'Profile', icon: User },
                        { value: 'security', label: 'Security', icon: Lock },
                        { value: 'chatbot', label: 'AI Assistant', icon: Bot },
                        { value: 'help', label: 'Help', icon: HelpCircle },
                        { value: 'tickets', label: 'Tickets', icon: Ticket },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="flex items-center gap-1.5 text-xs h-full px-3 rounded data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {/* ── Appearance ── */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Theme</CardTitle>
                            <CardDescription className="text-xs">Choose your preferred color scheme.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3 max-w-sm">
                                {themeOptions.map(opt => {
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setTheme(opt.value)}
                                            className={cn(
                                                'flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-sm transition-all duration-150',
                                                theme === opt.value
                                                    ? 'border-foreground bg-foreground/5 font-medium'
                                                    : 'border-border hover:border-foreground/30 text-muted-foreground'
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {opt.label}
                                            {theme === opt.value && <CheckCircle2 className="h-3 w-3 text-foreground" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Profile ── */}
                <TabsContent value="profile">
                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Profile Information</CardTitle>
                            <CardDescription className="text-xs">Update your display name and view account details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-sm">
                                <div className="space-y-1.5">
                                    <Label htmlFor="profile-name" className="text-sm">Display Name</Label>
                                    <Input
                                        id="profile-name"
                                        value={profileName}
                                        onChange={e => setProfileName(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Email</Label>
                                    <Input value={user?.email || ''} disabled className="h-9 bg-muted/50 text-muted-foreground" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Role</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize text-xs font-medium">
                                            <Shield className="h-3 w-3 mr-1" />
                                            {user?.role?.replace('-', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                                <Button type="submit" size="sm" disabled={savingProfile}>
                                    {savingProfile ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Save Profile'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Security ── */}
                <TabsContent value="security">
                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Change Password</CardTitle>
                            <CardDescription className="text-xs">Update your account password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                                {[
                                    { id: 'cp', label: 'Current Password', val: currentPassword, setter: setCurrentPassword },
                                    { id: 'np', label: 'New Password', val: newPassword, setter: setNewPassword },
                                    { id: 'cf', label: 'Confirm Password', val: confirmPassword, setter: setConfirmPassword },
                                ].map(f => (
                                    <div key={f.id} className="space-y-1.5">
                                        <Label htmlFor={f.id} className="text-sm">{f.label}</Label>
                                        <div className="relative">
                                            <Input
                                                id={f.id}
                                                type={showPw ? 'text' : 'password'}
                                                value={f.val}
                                                onChange={e => f.setter(e.target.value)}
                                                className="h-9 pr-9"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw(!showPw)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="submit" size="sm" disabled={savingPw}>
                                    {savingPw ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : 'Update Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── AI Chatbot ── */}
                <TabsContent value="chatbot">
                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                Procurement AI Assistant
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Ask about RA 9184, RA 12009, IRR, SVP, Shopping, Bidding, BAC, and PhilGEPS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col h-80 border border-border rounded-lg overflow-hidden">
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                    {chatMessages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                'flex gap-2 text-sm',
                                                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                            )}
                                        >
                                            <div className={cn(
                                                'h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5',
                                                msg.role === 'user'
                                                    ? 'bg-foreground text-background'
                                                    : 'bg-muted border border-border'
                                            )}>
                                                {msg.role === 'user' ? (user?.name?.charAt(0) || 'U') : <Bot className="h-3 w-3" />}
                                            </div>
                                            <div className={cn(
                                                'rounded-lg px-3 py-2 max-w-[80%] text-sm leading-relaxed',
                                                msg.role === 'user'
                                                    ? 'bg-foreground text-background'
                                                    : 'bg-muted text-foreground'
                                            )}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div className="flex gap-2">
                                            <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center">
                                                <Bot className="h-3 w-3" />
                                            </div>
                                            <div className="bg-muted rounded-lg px-3 py-2 flex gap-1 items-center">
                                                {[0, 1, 2].map(i => (
                                                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div className="border-t border-border p-2 flex gap-2">
                                    <Input
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                                        placeholder="Ask about procurement regulations..."
                                        className="h-8 text-xs"
                                    />
                                    <Button size="sm" onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading} className="h-8 px-2.5 shrink-0">
                                        <Send className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {['What is RA 9184?', 'Explain SVP', 'What is the BAC?', 'Shopping method', 'RA 12009'].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => { setChatInput(q); }}
                                        className="text-[11px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Help ── */}
                <TabsContent value="help" className="space-y-3">
                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Help & Manual</CardTitle>
                            <CardDescription className="text-xs">Reference documentation and guides.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { icon: FileText, title: 'User Manual', desc: 'Complete guide to using ProcureFlow', href: '#' },
                                { icon: Scale, title: 'RA 9184 Guide', desc: 'Government Procurement Reform Act overview', href: 'https://gppb.gov.ph/ra9184' },
                                { icon: BookOpen, title: 'IRR Reference', desc: 'Implementing Rules and Regulations', href: 'https://gppb.gov.ph/irr' },
                                { icon: AlertCircle, title: 'FAQ', desc: 'Frequently asked questions', href: '#' },
                            ].map(item => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.title}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </a>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Tickets ── */}
                <TabsContent value="tickets">
                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Submit a Ticket</CardTitle>
                            <CardDescription className="text-xs">Report issues or request assistance from the system administrator.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ticketSent ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
                                    <CheckCircle2 className="h-10 w-10 text-foreground" />
                                    <p className="font-medium text-foreground">Ticket Submitted</p>
                                    <p className="text-sm text-center">Your ticket has been received. The administrator will respond shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitTicket} className="space-y-4 max-w-md">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ticket-subject" className="text-sm">Subject</Label>
                                        <Input
                                            id="ticket-subject"
                                            value={ticketSubject}
                                            onChange={e => setTicketSubject(e.target.value)}
                                            placeholder="Brief description of the issue"
                                            className="h-9"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ticket-body" className="text-sm">Description</Label>
                                        <Textarea
                                            id="ticket-body"
                                            value={ticketBody}
                                            onChange={e => setTicketBody(e.target.value)}
                                            placeholder="Provide detailed information about your issue or request..."
                                            rows={4}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 text-xs text-muted-foreground border-t border-border pt-3">
                                        <p>Submitted by: <span className="font-medium text-foreground">{user?.name}</span></p>
                                        <p>Email: <span className="font-medium text-foreground">{user?.email}</span></p>
                                    </div>
                                    <Button type="submit" size="sm" disabled={sendingTicket}>
                                        {sendingTicket ? (
                                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Submitting...</>
                                        ) : (
                                            <><Send className="h-3.5 w-3.5 mr-1.5" />Submit Ticket</>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
